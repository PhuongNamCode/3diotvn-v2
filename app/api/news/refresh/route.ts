import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Shape we expect from Perplexity result after prompt engineering
type IngestNewsItem = {
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  source?: string;
  category?: string; // map into our News.category
  importance?: 'high' | 'medium' | 'low';
  publishedAt?: string; // ISO
  image?: string;
  tags?: string[];
  link?: string;
};

const ALLOWED_CATEGORIES = ['Communications', 'IoT', 'Embedded', 'AI', 'Hardware'] as const;

async function callPerplexity(prompt: string): Promise<any> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error('Missing PERPLEXITY_API_KEY');
  }
  // Model fallback order based on current Perplexity docs
  const preferred = process.env.PERPLEXITY_MODEL;
  const fallbackModels = [
    ...(preferred ? [preferred] : []),
    'sonar',
    'sonar-small-online',
    'sonar-medium-online'
  ];

  // Try models until one works
  let lastErrorText = '';
  let data: any = null;
  for (const model of fallbackModels) {
    const resp = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a helpful, precise news curator for engineering audiences.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 2000
      })
    });
    if (resp.ok) {
      data = await resp.json();
      break;
    }
    lastErrorText = await resp.text();
  }
  if (!data) {
    throw new Error(`Perplexity request failed for all models: ${lastErrorText}`);
  }
  return data;
}

async function callPerplexityForCategory(category: typeof ALLOWED_CATEGORIES[number]): Promise<IngestNewsItem[]> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const sources = [
    // Global/research/manufacturer
    'IEEE Spectrum', 'ACM TechNews', 'Electronics Weekly', 'Hackaday', 'SemiAnalysis',
    'ARM', 'RISC-V International', 'Espressif', 'Raspberry Pi', 'NVIDIA Jetson',
    'Edge Impulse', 'Qualcomm', 'NXP', 'STMicroelectronics', 'Texas Instruments', 'Analog Devices',
    // Vietnam reputable tech/business outlets
    'VnExpress Số Hóa', 'VnExpress', 'Tuổi Trẻ', 'Thanh Niên', 'VietnamPlus', 'VTV Digital',
    'Vietcetera', 'GenK', 'Tinhte', 'ICTNews', 'CafeBiz', 'CafeF'
  ];
  const taxHints: Record<string, string[]> = {
    Communications: ['5G', '6G', 'Wi‑Fi', 'Bluetooth', 'LPWAN', 'LoRa', 'NB‑IoT', 'satellite IoT', 'edge networking'],
    IoT: ['IoT platform', 'device management', 'sensor networks', 'smart home', 'industrial IoT', 'IIoT'],
    Embedded: ['firmware', 'RTOS', 'bare metal', 'MCU', 'Zephyr', 'FreeRTOS', 'toolchain', 'compiler'],
    AI: ['edge AI', 'TinyML', 'quantization', 'NPU', 'accelerator', 'optimization'],
    Hardware: ['SoC', 'silicon', 'RISC‑V', 'ARM', 'chip', 'board', 'reference design']
  };

  const prompt = `Bạn là biên tập viên kỹ thuật, viết tiếng Việt tự nhiên. Hãy thu thập tin tức chất lượng cao thuộc danh mục "${category}" trong phạm vi 7 ngày gần đây (kể từ ${since}).
Yêu cầu nghiêm ngặt:
- Chỉ lấy từ nguồn uy tín quốc tế VÀ Việt Nam (ví dụ: ${sources.join(', ')}), ưu tiên press release/bài chính thức/sự kiện lớn.
- Mỗi mục phải có liên kết (link) CHÍNH XÁC của bài viết gốc; KHÔNG nhận tóm tắt không có link.
- Tất cả nội dung (title, content, excerpt) đều phải bằng tiếng Việt.
- Excerpt phải dài khoảng 50–60 từ (không ngắn hơn 45, không dài hơn 70).
- Phải thuộc danh mục chính xác: category = "${category}" và thêm tags phù hợp (${taxHints[category].join(', ')}).
- publishedAt (ISO) bắt buộc nằm trong 7 ngày gần đây.
 - Trường source PHẢI là tên nhà xuất bản/website (ví dụ: "VnExpress", "IEEE Spectrum"), KHÔNG được là URL. URL chỉ để ở trường link.
Định dạng trả về: CHỈ một mảng JSON các object có các trường:
title, content (tóm tắt 4–6 câu), excerpt (50–60 từ), author, source, category, importance (high|medium|low), publishedAt (ISO), image, tags (mảng chuỗi), link (URL gốc, đầy đủ).
Không thêm lời giải thích, không kèm markdown, không bọc trong code block.`;

  const data = await callPerplexity(prompt);
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) return [];

  // Try to parse JSON from the LLM output (strip code fences if any)
  const jsonText = content
    .replace(/^```json\n?/i, '')
    .replace(/^```\n?/i, '')
    .replace(/```$/i, '')
    .trim();
  try {
    const parsed = JSON.parse(jsonText);
    if (Array.isArray(parsed)) return parsed as IngestNewsItem[];
    if (Array.isArray(parsed.items)) return parsed.items as IngestNewsItem[];
  } catch {}
  return [];
}

function inferCategory(item: IngestNewsItem): string {
  const fields = [item.category, item.title, item.content, ...(item.tags || [])].join(' ').toLowerCase();
  // Communications first to avoid mislabeling 5G/6G as IoT
  if (/(5g|6g|wi[- ]?fi|wifi|bluetooth|lpwan|lo[\- ]?ra|nb-?iot|satellite|carrier|telco|operator|base\s?station|ran|core\s?network)/.test(fields)) {
    return 'Communications';
  }
  if (/(embedded|firmware|rtos|mcu|microcontroller|bare metal|zephyr|freertos|toolchain|compiler)/.test(fields)) {
    return 'Embedded';
  }
  if (/(ai|ml|machine learning|tinyml|edge ai|npu|accelerator|llm|model)/.test(fields)) {
    return 'AI';
  }
  if (/(hardware|chip|soc|silicon|die|board|reference\s?design|fpga|asic|risc[- ]?v|arm)/.test(fields)) {
    return 'Hardware';
  }
  if (/(iot|internet of things|iiot|device\smanagement|sensor\snetwork)/.test(fields)) {
    return 'IoT';
  }
  return 'IoT';
}

export async function POST(request: NextRequest) {
  try {
    // Optional override
    const body = request.body ? await request.json().catch(() => ({})) : {};
    const categories: typeof ALLOWED_CATEGORIES = (Array.isArray(body?.categories) && body.categories.length)
      ? body.categories
          .map((c: string) => (ALLOWED_CATEGORIES as readonly string[]).find(a => a.toLowerCase() === String(c).toLowerCase()))
          .filter(Boolean) as typeof ALLOWED_CATEGORIES
      : [...ALLOWED_CATEGORIES];

    // Fetch per-category to ensure coverage and labels
    let incoming: IngestNewsItem[] = [];
    for (const cat of categories) {
      const items = await callPerplexityForCategory(cat);
      // Do NOT override category from the model; we'll infer robustly from content
      incoming = incoming.concat(items);
    }

    if (!incoming.length) {
      return NextResponse.json({ success: true, ingested: 0, skipped: 0, items: [] });
    }

    let ingested = 0;
    let skipped = 0;
    const createdItems: string[] = [];

    for (const item of incoming) {
      const title = item.title?.trim();
      const linkVal = item.link ? item.link.trim() : undefined;
      if (!title) { skipped++; continue; }

      // Validate publishedAt within 7 days
      const now = Date.now();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const pubDate = item.publishedAt ? new Date(item.publishedAt) : new Date();
      if (isNaN(pubDate.getTime()) || now - pubDate.getTime() > sevenDaysMs) {
        skipped++;
        continue;
      }

      // Normalize excerpt to ~50–60 words
    const baseExcerpt = (item.excerpt?.trim() || item.content?.trim() || title).replace(/\s+/g, ' ').trim();
    // quick Vietnamese heuristic: must contain at least one diacritic or common Vietnamese word
    const looksVietnamese = /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụỳýỷỹỵ]/i.test(baseExcerpt)
      || /(và|của|trong|với|được|không|công|nghệ|thiết|bị|hệ|thống)/i.test(baseExcerpt);
    if (!looksVietnamese) { skipped++; continue; }
      const words = baseExcerpt.split(' ');
      let excerpt = baseExcerpt;
      if (words.length < 45) {
        excerpt = baseExcerpt; // keep as-is if too short; we already requested 50–60 via prompt
      } else if (words.length > 70) {
        excerpt = words.slice(0, 60).join(' ');
      }

      // Basic dedupe: by link if present, else by lowercased title
      const existing = await prisma.news.findFirst({
        where: linkVal ? { link: linkVal } : { title }
      });
      if (existing) { skipped++; continue; }

      // Derive clean source name from link if source is missing or looks like URL
      let sourceClean = (item.source || '').trim();
      const isUrlLike = /^(https?:)?\/\//i.test(sourceClean);
      if ((!sourceClean || isUrlLike) && linkVal) {
        try {
          const u = new URL(linkVal.startsWith('http') ? linkVal : `https://${linkVal}`);
          const host = u.hostname.replace(/^www\./, '');
          // Map common hosts to brand names
          const hostMap: Record<string, string> = {
            'vnexpress.net': 'VnExpress',
            'sohoa.vnexpress.net': 'VnExpress Số Hóa',
            'tuoitre.vn': 'Tuổi Trẻ',
            'thanhnien.vn': 'Thanh Niên',
            'vietnamplus.vn': 'VietnamPlus',
            'vtv.vn': 'VTV',
            'genk.vn': 'GenK',
            'tinhte.vn': 'Tinhte',
            'ictnews.vietnamnet.vn': 'ICTNews',
            'cafebiz.vn': 'CafeBiz',
            'cafef.vn': 'CafeF',
            'spectrum.ieee.org': 'IEEE Spectrum',
            'acm.org': 'ACM',
            'hackaday.com': 'Hackaday',
            'electronicsweekly.com': 'Electronics Weekly',
            'semianalysis.com': 'SemiAnalysis',
            'arm.com': 'ARM',
            'riscv.org': 'RISC-V International',
            'espressif.com': 'Espressif',
            'raspberrypi.com': 'Raspberry Pi',
            'developer.nvidia.com': 'NVIDIA',
            'edgeimpulse.com': 'Edge Impulse',
            'nxp.com': 'NXP',
            'st.com': 'STMicroelectronics',
            'ti.com': 'Texas Instruments',
            'analog.com': 'Analog Devices'
          };
          sourceClean = hostMap[host] || host;
        } catch {}
      }

      const data: Record<string, any> = {
        title,
        content: item.content?.trim() || excerpt,
        excerpt,
        author: item.author?.trim() || 'Unknown',
        source: sourceClean || 'Unknown',
        category: inferCategory(item),
        importance: item.importance || 'medium',
        published: true,
        publishedAt: pubDate,
        image: item.image || null,
        tags: Array.isArray(item.tags) ? item.tags : []
      };
      if (linkVal) data.link = linkVal;
      const created = await prisma.news.create({ data: data as any });
      ingested++;
      createdItems.push(String(created.id));
    }

    return NextResponse.json({ success: true, ingested, skipped, ids: createdItems });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to refresh news' },
      { status: 500 }
    );
  }
}


    