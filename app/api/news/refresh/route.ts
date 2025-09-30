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

// Helper function to detect Vietnamese sources
function isVietnameseSource(source: string): boolean {
  const vietnamesePatterns = [
    'vnexpress', 'genk', 'tinhte', 'ictnews', 'tuoitre', 'thanhnien', 
    'vietnamplus', 'vtv', 'cafebiz', 'cafef', 'chinhphu', 'nhandan',
    'sansukien', 'vietnamexhibition', 'topdev', 'tapchicongthuong',
    'dantri', 'vietnamnet', 'zing', 'kenh14', 'soha', 'tienphong',
    'laodong', 'nguoiduatin', 'vietnam', 'vn', 'viet'
  ];
  
  const sourceLower = source.toLowerCase();
  return vietnamesePatterns.some(pattern => sourceLower.includes(pattern));
}

async function getSettings() {
  try {
    const [apiKeyRow, modelRow] = await Promise.all([
      (prisma as any).setting.findUnique({ where: { key: 'perplexity.apiKey' } }),
      (prisma as any).setting.findUnique({ where: { key: 'perplexity.model' } }),
    ]);
    return {
      apiKey: (apiKeyRow?.value || process.env.PERPLEXITY_API_KEY || '').trim(),
      model: (modelRow?.value || process.env.PERPLEXITY_MODEL || 'sonar').trim(),
    };
  } catch {
    // Fallback when settings table does not exist yet
    return {
      apiKey: (process.env.PERPLEXITY_API_KEY || '').trim(),
      model: (process.env.PERPLEXITY_MODEL || 'sonar').trim(),
    };
  }
}

async function callPerplexity(prompt: string): Promise<any> {
  const { apiKey, model } = await getSettings();
  if (!apiKey) {
    throw new Error('Missing PERPLEXITY_API_KEY');
  }
  // Model fallback order based on current Perplexity docs
  const preferred = model;
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
  // Optimized sources list - top 20 most relevant per category
  const sources: Record<string, string[]> = {
    Communications: ['Vodafone', 'Telefonica', 'Verizon', 'AT&T', 'Ericsson', 'Nokia', 'Cisco', '3GPP', 'ITU', 'GSMA', 'Light Reading', 'Fierce Telecom', 'RCR Wireless', 'Mobile World Live', 'Network World', 'IEEE Spectrum', 'Ars Technica', 'TechCrunch', 'Wired', 'MIT Technology Review', 'VnExpress', 'GenK', 'Tinhte', 'ICTNews'],
    IoT: ['AWS IoT', 'Microsoft Azure IoT', 'Google Cloud IoT', 'Siemens', 'Bosch', 'Honeywell', 'Espressif', 'Arduino', 'Particle', 'Nordic Semiconductor', 'LoRa Alliance', 'Zigbee Alliance', 'Thread Group', 'Edge Impulse', 'Raspberry Pi', 'IEEE Spectrum', 'Hackaday', 'Electronics Weekly', 'Ars Technica', 'TechCrunch', 'VnExpress', 'GenK', 'Tinhte', 'ICTNews'],
    Embedded: ['Intel', 'ARM', 'NVIDIA', 'Qualcomm', 'AMD', 'STMicroelectronics', 'Texas Instruments', 'Microchip', 'Silicon Labs', 'NXP', 'Cypress', 'Atmel', 'Digi-Key', 'Mouser Electronics', 'Arrow Electronics', 'IEEE Spectrum', 'Hackaday', 'Electronics Weekly', 'EDN Network', 'EE Times', 'VnExpress', 'GenK', 'Tinhte', 'ICTNews'],
    AI: ['NVIDIA', 'Intel', 'AMD', 'Qualcomm', 'Google', 'Apple', 'Amazon', 'TensorFlow', 'PyTorch', 'MIT', 'Stanford', 'Berkeley', 'Google AI', 'Microsoft Research', 'Edge Impulse', 'IEEE Spectrum', 'Ars Technica', 'TechCrunch', 'Wired', 'MIT Technology Review', 'VnExpress', 'GenK', 'Tinhte', 'ICTNews'],
    Hardware: ['Intel', 'AMD', 'ARM', 'NVIDIA', 'Qualcomm', 'Broadcom', 'MediaTek', 'STMicroelectronics', 'Texas Instruments', 'NXP', 'RISC-V International', 'Open Compute Project', 'PCI-SIG', 'USB-IF', 'IEEE Spectrum', 'Hackaday', 'Electronics Weekly', 'EDN Network', 'EE Times', 'Ars Technica', 'VnExpress', 'GenK', 'Tinhte', 'ICTNews']
  };
  const taxHints: Record<string, string[]> = {
    Communications: ['5G', '6G', 'Wi‑Fi', 'Bluetooth', 'LPWAN', 'LoRa', 'NB‑IoT', 'satellite IoT', 'edge networking'],
    IoT: ['IoT platform', 'device management', 'sensor networks', 'smart home', 'industrial IoT', 'IIoT'],
    Embedded: ['firmware', 'RTOS', 'bare metal', 'MCU', 'Zephyr', 'FreeRTOS', 'toolchain', 'compiler'],
    AI: ['edge AI', 'TinyML', 'quantization', 'NPU', 'accelerator', 'optimization'],
    Hardware: ['SoC', 'silicon', 'RISC‑V', 'ARM', 'chip', 'board', 'reference design']
  };

  const prompt = `Find recent ${category} tech news (last 7 days, since ${since}). 

REQUIREMENTS:
- Sources: ${sources[category].join(', ')}
- RATIO: 60% international sources, 40% Vietnam sources
- Content in Vietnamese
- Excerpt: 80-100 words (66-100)
- Category: "${category}" with tags: ${taxHints[category].join(', ')}
- Published within last 7 days
- Source = publisher name

PRIORITY: International sources first, then Vietnam sources
Include both international and Vietnamese sources as needed

FORMAT: JSON array with fields:
title, content (4-6 sentences), excerpt (80-100 words), author, source, category, importance (high|medium|low), publishedAt (ISO), image, tags (array), link (URL).

No explanations, no markdown.`;

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
    
    // Track source ratio for 60/40 balance
    let internationalCount = 0;
    let vietnamCount = 0;
    const maxInternational = Math.ceil(10 * 0.6); // 60% of 10 items
    const maxVietnam = Math.floor(10 * 0.4); // 40% of 10 items

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
      if (words.length < 66) {
        excerpt = baseExcerpt; // keep as-is if too short; we already requested 80-100 via prompt
      } else if (words.length > 100) {
        excerpt = words.slice(0, 100).join(' ');
      }

      // Derive clean source name from link if source is missing or looks like URL
      let sourceClean = (item.source || '').trim();
      const isUrlLike = /^(https?:)?\/\//i.test(sourceClean);
      if ((!sourceClean || isUrlLike) && linkVal) {
        try {
          const u = new URL(linkVal.startsWith('http') ? linkVal : `https://${linkVal}`);
          const host = u.hostname.replace(/^www\./, '');
          // Map common hosts to brand names
          const hostMap: Record<string, string> = {
            // Global tech magazines & research
            'spectrum.ieee.org': 'IEEE Spectrum',
            'acm.org': 'ACM',
            'hackaday.com': 'Hackaday',
            'electronicsweekly.com': 'Electronics Weekly',
            'semianalysis.com': 'SemiAnalysis',
            'arstechnica.com': 'Ars Technica',
            'theverge.com': 'The Verge',
            'techcrunch.com': 'TechCrunch',
            'wired.com': 'Wired',
            'technologyreview.com': 'MIT Technology Review',
            'nature.com': 'Nature Electronics',
            'edn.com': 'EDN Network',
            'eetimes.com': 'EE Times',
            'electronicdesign.com': 'Electronic Design',
            'designnews.com': 'Design News',
            'fierceelectronics.com': 'Fierce Electronics',
            
            // Major chip/hardware manufacturers
            'intel.com': 'Intel',
            'amd.com': 'AMD',
            'arm.com': 'ARM',
            'nvidia.com': 'NVIDIA',
            'qualcomm.com': 'Qualcomm',
            'broadcom.com': 'Broadcom',
            'mediatek.com': 'MediaTek',
            'infineon.com': 'Infineon',
            'microchip.com': 'Microchip',
            'silabs.com': 'Silicon Labs',
            'st.com': 'STMicroelectronics',
            'ti.com': 'Texas Instruments',
            'analog.com': 'Analog Devices',
            'nxp.com': 'NXP',
            'renesas.com': 'Renesas',
            'cypress.com': 'Cypress',
            'atmel.com': 'Atmel',
            'nordicsemi.com': 'Nordic Semiconductor',
            'semtech.com': 'Semtech',
            'dialog-semiconductor.com': 'Dialog Semiconductor',
            'onsemi.com': 'ON Semiconductor',
            'maximintegrated.com': 'Maxim Integrated',
            
            // IoT/Embedded companies
            'espressif.com': 'Espressif',
            'arduino.cc': 'Arduino',
            'particle.io': 'Particle',
            'raspberrypi.com': 'Raspberry Pi',
            'developer.nvidia.com': 'NVIDIA Jetson',
            'edgeimpulse.com': 'Edge Impulse',
            'aws.amazon.com': 'AWS IoT',
            'azure.microsoft.com': 'Microsoft Azure IoT',
            'cloud.google.com': 'Google Cloud IoT',
            'ibm.com': 'IBM Watson IoT',
            'siemens.com': 'Siemens',
            'bosch.com': 'Bosch',
            'honeywell.com': 'Honeywell',
            'se.com': 'Schneider Electric',
            'abb.com': 'ABB',
            'rockwellautomation.com': 'Rockwell Automation',
            
            // Communications & Telecom
            'vodafone.com': 'Vodafone',
            'telefonica.com': 'Telefonica',
            'telekom.com': 'Deutsche Telekom',
            'orange.com': 'Orange',
            't-mobile.com': 'T-Mobile',
            'verizon.com': 'Verizon',
            'att.com': 'AT&T',
            'sprint.com': 'Sprint',
            'softbank.com': 'SoftBank',
            'ntt.com': 'NTT',
            'sktelecom.com': 'SK Telecom',
            'kt.com': 'KT Corporation',
            'lguplus.co.kr': 'LG Uplus',
            'ericsson.com': 'Ericsson',
            'nokia.com': 'Nokia',
            'huawei.com': 'Huawei',
            'zte.com.cn': 'ZTE',
            'cisco.com': 'Cisco',
            'juniper.net': 'Juniper Networks',
            'ciena.com': 'Ciena',
            '3gpp.org': '3GPP',
            'itu.int': 'ITU',
            'etsi.org': 'ETSI',
            'gsma.com': 'GSMA',
            '5gamericas.org': '5G Americas',
            '5g-acia.org': '5G-ACIA',
            'lora-alliance.org': 'LoRa Alliance',
            'wi-fi.org': 'Wi-Fi Alliance',
            'bluetooth.com': 'Bluetooth SIG',
            'zigbee.org': 'Zigbee Alliance',
            'threadgroup.org': 'Thread Group',
            
            // Distributors & Supply Chain
            'digikey.com': 'Digi-Key',
            'mouser.com': 'Mouser Electronics',
            'arrow.com': 'Arrow Electronics',
            'avnet.com': 'Avnet',
            'farnell.com': 'Farnell',
            'rs-online.com': 'RS Components',
            'newark.com': 'Newark',
            'futureelectronics.com': 'Future Electronics',
            'tti.com': 'TTI',
            'wpg.com': 'WPG Holdings',
            
            // Research Institutions
            'mit.edu': 'MIT',
            'stanford.edu': 'Stanford',
            'berkeley.edu': 'Berkeley',
            'cmu.edu': 'Carnegie Mellon',
            'gatech.edu': 'Georgia Tech',
            'caltech.edu': 'Caltech',
            'ox.ac.uk': 'Oxford',
            'cam.ac.uk': 'Cambridge',
            'imperial.ac.uk': 'Imperial College',
            'ethz.ch': 'ETH Zurich',
            'tudelft.nl': 'TU Delft',
            'kaist.ac.kr': 'KAIST',
            'tsinghua.edu.cn': 'Tsinghua',
            'pku.edu.cn': 'Peking University',
            'u-tokyo.ac.jp': 'Tokyo University',
            
            // Industry Organizations
            'riscv.org': 'RISC-V International',
            'opencompute.org': 'Open Compute Project',
            'linuxfoundation.org': 'Linux Foundation',
            'eclipse.org': 'Eclipse Foundation',
            'apache.org': 'Apache Software Foundation',
            'mozilla.org': 'Mozilla Foundation',
            'oshwa.org': 'Open Source Hardware Association',
            'openhardwaregroup.org': 'Open Hardware Group',
            
            // Specialized Tech Publications
            'lightreading.com': 'Light Reading',
            'fiercetelecom.com': 'Fierce Telecom',
            'rcrwireless.com': 'RCR Wireless',
            'mobileworldlive.com': 'Mobile World Live',
            'telecoms.com': 'Telecoms.com',
            'capacitymedia.com': 'Capacity Media',
            'totaltele.com': 'Total Telecom',
            'commsbusiness.co.uk': 'Comms Business',
            'networkworld.com': 'Network World',
            'computerworld.com': 'Computerworld',
            'informationweek.com': 'InformationWeek',
            'zdnet.com': 'ZDNet',
            'bizjournals.com': 'Silicon Valley Business Journal',
            'venturebeat.com': 'VentureBeat',
            'geekwire.com': 'GeekWire',
            'news.ycombinator.com': 'Hacker News',
            'reddit.com': 'Reddit'
          };
          sourceClean = hostMap[host] || host;
        } catch {}
      }

      // No filtering - let Perplexity AI decide the sources based on prompt
      
      // Check if source is Vietnam or International based on common patterns
      const isVietnamSource = isVietnameseSource(sourceClean);
      
      // Apply 60/40 ratio limit
      if (isVietnamSource && vietnamCount >= maxVietnam) {
        skipped++;
        continue;
      }
      if (!isVietnamSource && internationalCount >= maxInternational) {
        skipped++;
        continue;
      }

      // Basic dedupe: by link if present, else by lowercased title
      const existing = await prisma.news.findFirst({
        where: linkVal ? { link: linkVal } : { title }
      });
      if (existing) { skipped++; continue; }

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
      
      // Update counters
      if (isVietnamSource) {
        vietnamCount++;
      } else {
        internationalCount++;
      }
    }

    // Persist last refresh timestamp if settings table exists
    try {
      await (prisma as any).setting.upsert({
        where: { key: 'news.lastRefreshAt' },
        create: { key: 'news.lastRefreshAt', value: new Date().toISOString() },
        update: { value: new Date().toISOString() },
      });
    } catch {}

    return NextResponse.json({ success: true, ingested, skipped, ids: createdItems });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to refresh news' },
      { status: 500 }
    );
  }
}


    