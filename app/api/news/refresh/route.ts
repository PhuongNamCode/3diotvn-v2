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
  publishedAt?: string; // ISO
  image?: string;
  tags?: string[];
  link?: string;
};

const ALLOWED_CATEGORIES = ['Communications', 'IoT', 'Embedded', 'AI', 'Hardware'] as const;


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
  console.log('🔑 API Key exists:', !!apiKey);
  console.log('🤖 Model:', model);
  
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
        max_tokens: 20000
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

// Helper function to extract JSON from various Perplexity response formats
function extractJsonFromContent(content: string): string {
  // Remove markdown code blocks
  let cleaned = content.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim();
  
  // Find JSON array boundaries
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']') + 1;
  
  if (start !== -1 && end > start) {
    cleaned = cleaned.substring(start, end);
  }
  
  // Remove any leading/trailing text
  cleaned = cleaned.trim();
  
  return cleaned;
}

async function callPerplexityForCategory(category: typeof ALLOWED_CATEGORIES[number]): Promise<IngestNewsItem[]> {
  console.log(`📡 Calling Perplexity for category: ${category}`);
  
  // Category-specific sources
  const sources: Record<string, string[]> = {
    Communications: [
      'lightreading.com','tecknexus.com','telecoms.com','vista.gov.vn','3GPP','AT&T','Verizon','T-Mobile','Vodafone','Orange','Telefonica','China Mobile','NTT Docomo','SK Telecom','Singtel','Ericsson','Nokia','Huawei','Cisco','IEEE Spectrum','TechCrunch','Ars Technica','Wired','Network World','Fierce Telecom','Light Reading','VnExpress','GenK','Tinhte','ICTNews','viettel',
      'telecomtv.com','the-mobile-network.com','mobileworldlive.com','ngmn.org','o-ran.org','gsacom.com','delloro.com','analysysmason.com','tefficient.com','blog.telegeography.com','speedtest.net/insights','inform.tmforum.org','capacitymedia.com','rcrwireless.com',
      '3gpp.org','etsi.org','ietf.org','tmforum.org','fcc.gov','berec.europa.eu','ofcom.org.uk'
    ],
    IoT: [
      'talkingiot.io','iottechnews','iotbusinessnews','iotm2mcouncil','Arduino','Raspberry Pi','STMicroelectronics','Texas Instruments','Microchip','Espressif','IEEE Spectrum','TechCrunch','Bao moi','Electronics Weekly','VnExpress',
      'staceyoniot.com','iot-analytics.com','iiot-world.com','lora-alliance.org','csa-iot.org','threadgroup.org','bluetooth.com/blog','postscapes.com','edgeimpulse.com/blog','cnx-software.com'
    ],
    Embedded: [
      'Intel','ARM','NVIDIA','STMicroelectronics','Texas Instruments','Microchip','Espressif','Nordic Semiconductor','IEEE Spectrum','Hackaday','Electronics Weekly','EDN Network','EE Times','VnExpress','GenK','Tinhte',
      'cnx-software.com','lwn.net','phoronix.com','zephyrproject.org/blog','freertos.org','platformio.org/blog','adafruit.com/blog','sparkfun.com/news'
    ],
    AI: [
      'NVIDIA','Google','OpenAI','Microsoft','Meta','Intel AI','AMD AI','MIT','Stanford','Berkeley','IEEE Spectrum','TechCrunch','MIT Technology Review','VnExpress','GenK','Tinhte',
      'deepmind.google/discover/blog','anthropic.com/news','huggingface.co/blog','ai.googleblog.com','ai.meta.com/blog','microsoft.com/en-us/research/blog','bair.berkeley.edu/blog','paperswithcode.com','thegradient.pub','importai.substack.com'
    ],
    Hardware: [
      'Intel','AMD','ARM','NVIDIA','Qualcomm','Broadcom','MediaTek','Apple','Samsung','TSMC','IEEE Spectrum','Hackaday','Electronics Weekly','EDN Network','EE Times','VnExpress','GenK',
      'anandtech.com','servethehome.com','semianalysis.com','semiengineering.com','techinsights.com','notebookcheck.net','chipsandcheese.com','computerbase.de','phoronix.com',
      'techinsights.com/daily-insights','counterpointresearch.com','trendforce.com','asml.com/en/news','imec-int.com/en/articles'
    ],
  };
  

  const prompt = `Bạn là một chuyên gia tổng hợp và phân tích tin tức. Bạn hãy tìm kiếm tin tức thật cẩn thận.
Hãy tìm và tổng hợp đầy đủ (tối thiểu 10 tin tức) những tin tức mới nhất về ${category} trong 1 tháng qua từ các nguồn báo lớn uy tín chất lượng quốc tế và trong nước.

Hãy tập trung lấy thông tin thật đầy đủ và mới từ các nguồn: ${sources[category].join(', ')}

Yêu cầu:
1. Chỉ lấy tin **trong vòng 1 tháng qua**.
2. Ưu tiên các tin tức quốc tế từ các tổ chức công nghệ quốc tế lớn.
2. Mỗi tin tức phải có **link gốc thật** từ bài báo.
3. **Tiêu đề và tóm tắt PHẢI bằng tiếng Việt** (có thể có thuật ngữ kỹ thuật tiếng Anh).
4. Tóm tắt dài 60-800 từ.
5. Trả lời theo đúng format JSON sau (mảng JSON), không thêm bất cứ text nào ngoài JSON:

FORMAT JSON: [{ "title": "Tiêu đề bằng tiếng Việt", "content": "Nội dung", "excerpt": "Tóm tắt 80-100 từ bằng tiếng Việt", "author": "Tác giả", "source": "Nguồn", "category": "${category}", "publishedAt": "2024-12-09T10:00:00Z", "link": "URL" }];

Hãy trả lời dưới dạng một mảng JSON, mỗi phần tử là một bài báo.`;

  const data = await callPerplexity(prompt);
  console.log(`🔍 Perplexity API response for ${category}:`, data);
  
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  console.log(`📝 Content length for ${category}:`, content?.length || 0);
  
  if (!content) {
    console.log(`❌ No content from Perplexity for ${category}`);
    return [];
  }

  // Parse JSON from content - handle multiple formats
  try {
    // Try direct parse first
    const parsed = JSON.parse(content);
    console.log(`✅ Direct JSON parse successful for ${category}, items:`, parsed.length);
    if (Array.isArray(parsed)) return parsed as IngestNewsItem[];
  } catch (directError) {
    console.log(`⚠️ Direct parse failed for ${category}, trying extraction...`);
    
    try {
      // Try extracting JSON from content
      const cleanedJson = extractJsonFromContent(content);
      console.log(`🧹 Cleaned JSON length: ${cleanedJson.length}`);
      console.log(`🧹 Cleaned JSON preview: ${cleanedJson.substring(0, 200)}...`);
      
      const parsed = JSON.parse(cleanedJson);
      console.log(`✅ Extracted JSON parse successful for ${category}, items:`, parsed.length);
      
      if (Array.isArray(parsed)) {
        return parsed as IngestNewsItem[];
      } else {
        console.log(`⚠️ Extracted content is not an array, got:`, typeof parsed);
        return [];
      }
    } catch (extractError) {
      console.log(`❌ Both direct and extracted JSON parse failed for ${category}`);
      console.log(`❌ Direct error:`, directError instanceof Error ? directError.message : String(directError));
      console.log(`❌ Extract error:`, extractError instanceof Error ? extractError.message : String(extractError));
      console.log('📝 Raw content (first 500 chars):', content.substring(0, 500));
      console.log('🧹 Cleaned content (first 500 chars):', extractJsonFromContent(content).substring(0, 500));
    }
  }
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
    console.log('🚀 Starting news refresh...');
    
    // Fetch per-category for better results
    let incoming: IngestNewsItem[] = [];
    console.log('📡 Calling Perplexity API for each category...');
    
    for (const category of ALLOWED_CATEGORIES) {
      console.log(`🔄 Processing category: ${category}`);
      const items = await callPerplexityForCategory(category);
      console.log(`📰 Category ${category} returned ${items.length} items`);
      incoming = incoming.concat(items);
      
      // Small delay between API calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`📰 Total items from all categories: ${incoming.length}`);

    if (!incoming.length) {
      console.log('❌ No items received from Perplexity');
      return NextResponse.json({ success: true, ingested: 0, skipped: 0, items: [] });
    }

    let ingested = 0;
    let skipped = 0;
    
    console.log(`🔄 Processing ${incoming.length} items...`);

    for (const item of incoming) {
      const title = item.title?.trim();
      const linkVal = item.link ? item.link.trim() : undefined;
      if (!title) { skipped++; continue; }


      // Simplified URL validation - only basic format check
      if (linkVal && !linkVal.startsWith('http') && !linkVal.includes('.')) {
        console.log(`Invalid URL format: ${linkVal}, skipping article`);
        skipped++;
        continue;
      }

      // Validate publishedAt within 1 month (as required by prompt)
      const now = Date.now();
      const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
      const pubDate = item.publishedAt ? new Date(item.publishedAt) : new Date();
      if (isNaN(pubDate.getTime()) || now - pubDate.getTime() > oneMonthMs) {
        skipped++;
        continue;
      }

      // NO EXCERPT FILTERING - accept any length
    const baseExcerpt = (item.excerpt?.trim() || item.content?.trim() || title).replace(/\s+/g, ' ').trim();
      const excerpt = baseExcerpt; // Keep original excerpt as-is

      // Simple source extraction from link if source is missing
      let sourceClean = (item.source || '').trim();
      if (!sourceClean && linkVal) {
        try {
          const u = new URL(linkVal.startsWith('http') ? linkVal : `https://${linkVal}`);
          sourceClean = u.hostname.replace(/^www\./, '');
        } catch {}
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
        importance: 'medium', // Fixed value - no need for complexity
        published: true,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
        image: item.image || null,
        tags: Array.isArray(item.tags) ? item.tags : []
      };
      if (linkVal) data.link = linkVal;
      await prisma.news.create({ data: data as any });
      ingested++;
    }

    // Persist last refresh timestamp if settings table exists
    try {
      await (prisma as any).setting.upsert({
        where: { key: 'news.lastRefreshAt' },
        create: { key: 'news.lastRefreshAt', value: new Date().toISOString() },
        update: { value: new Date().toISOString() },
      });
    } catch {}

    console.log(`✅ Completed: ${ingested} ingested, ${skipped} skipped`);
    return NextResponse.json({ success: true, ingested, skipped });
  } catch (error: any) {
    console.log('❌ Error:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to refresh news' },
      { status: 500 }
    );
  }
}


    