
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/html.js
function getDashboardHtml() {
  return `<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-950 text-slate-100">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloudflare Unified Network Dashboard</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            cf: {
              orange: '#f6821f',
              blue: '#0051c3',
              dark: '#1e293b'
            }
          }
        }
      }
    }
  <\/script>
  <style>
    /* Custom scrollbars and transitions */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #475569; }
    .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .badge-bot { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .badge-human { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
  </style>
</head>
<body class="h-full flex flex-col font-sans antialiased text-slate-200">
  <!-- Top Navigation Bar -->
  <header class="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h1 class="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Cloudflare Unified Analytics
            <span class="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">Edge & R2</span>
          </h1>
          <p class="text-xs text-slate-400">11 Monitored Sites &bull; Media &amp; Game Plays &bull; Downloads &bull; Bot Detection</p>
        </div>
      </div>

      <!-- Controls: Site Selector + Range Selector -->
      <div class="flex items-center flex-wrap gap-2.5">
        <!-- Site Selector -->
        <div class="relative">
          <select id="siteFilter" class="bg-slate-800 text-white text-xs font-medium rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer">
            <option value="all">\u{1F310} All Sites (Network Aggregate)</option>
            <option value="methodiusmedia">methodiusmedia.com</option>
            <option value="courses-methodiusmedia">courses.methodiusmedia.com (Ghost)</option>
            <option value="illuminatedrosary">illuminatedrosary.com</option>
            <option value="sdcason">sdcason.com (Ghost)</option>
            <option value="catholicsketchbook">catholicsketchbook.com</option>
            <option value="methodius-media">methodius.media</option>
            <option value="catholiclofi">catholiclofi.com</option>
            <option value="shalonely">shalonely.com (Naked Only)</option>
            <option value="picoparish">picoparish.com</option>
            <option value="angelio">angelio.org</option>
          </select>
        </div>

        <!-- Time Range Selector -->
        <div class="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
          <button data-range="24h" class="range-btn px-2.5 py-1 text-xs font-medium rounded-md transition-all text-slate-400 hover:text-white">24h</button>
          <button data-range="7d" class="range-btn px-2.5 py-1 text-xs font-medium rounded-md transition-all bg-orange-500 text-white shadow-sm">7d</button>
          <button data-range="30d" class="range-btn px-2.5 py-1 text-xs font-medium rounded-md transition-all text-slate-400 hover:text-white">30d</button>
        </div>

        <!-- Refresh Button -->
        <button id="refreshBtn" title="Refresh Analytics" class="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition">
          <svg id="refreshIcon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <!-- Ignore My IP Toggle Button -->
        <button id="toggleIpBtn" title="Ignore traffic and plays from your current device/Wi-Fi" class="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-slate-500 transition flex items-center gap-1.5">
          <span id="ipDot" class="w-2 h-2 rounded-full bg-slate-500"></span>
          <span id="ipBtnText">Detecting IP...</span>
        </button>

        <!-- Ghost / Setup Modal Button -->
        <button id="openSetupBtn" class="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Setup & Snippets
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content Container -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

    <!-- Notice / Alert Banner if token is missing or error -->
    <div id="statusAlert" class="hidden rounded-xl p-4 border text-sm flex items-start gap-3"></div>

    <!-- Top KPI Cards Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      <!-- 1. Total Visits -->
      <div class="glass p-4 rounded-xl relative overflow-hidden group hover:border-slate-700 transition">
        <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Page Visits</div>
        <div id="metricVisits" class="text-2xl font-bold text-white mt-1">--</div>
        <div class="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span id="metricPageViews">-- page views</span>
        </div>
      </div>

      <!-- 2. Unique Visitors -->
      <div class="glass p-4 rounded-xl relative overflow-hidden group hover:border-slate-700 transition">
        <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unique Visitors</div>
        <div id="metricUniques" class="text-2xl font-bold text-white mt-1">--</div>
        <div class="text-[11px] text-slate-400 mt-0.5">Estimated IPs</div>
      </div>

      <!-- 3. Song Plays -->
      <div class="glass p-4 rounded-xl relative overflow-hidden group hover:border-slate-700 transition">
        <div class="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
          Song Plays
        </div>
        <div id="metricSongPlays" class="text-2xl font-bold text-purple-300 mt-1">--</div>
        <div class="text-[11px] text-slate-400 mt-0.5">MP3, M4A, WAV</div>
      </div>

      <!-- 4. Video Plays -->
      <div class="glass p-4 rounded-xl relative overflow-hidden group hover:border-slate-700 transition">
        <div class="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          Video Plays
        </div>
        <div id="metricVideoPlays" class="text-2xl font-bold text-blue-300 mt-1">--</div>
        <div class="text-[11px] text-slate-400 mt-0.5">MP4, MOV, Ghost</div>
      </div>

      <!-- 5. Game Plays -->
      <div class="glass p-4 rounded-xl relative overflow-hidden group hover:border-slate-700 transition">
        <div class="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Game Plays
        </div>
        <div id="metricGamePlays" class="text-2xl font-bold text-amber-300 mt-1">--</div>
        <div class="text-[11px] text-slate-400 mt-0.5">PICO-8 &amp; Embeds</div>
      </div>

      <!-- 6. Downloads -->
      <div class="glass p-4 rounded-xl relative overflow-hidden group hover:border-slate-700 transition">
        <div class="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Downloads
        </div>
        <div id="metricDownloads" class="text-2xl font-bold text-emerald-300 mt-1">--</div>
        <div class="text-[11px] text-slate-400 mt-0.5">PDFs, Zips, Assets</div>
      </div>

      <!-- 7. Bot & Threat Ratio -->
      <div class="glass p-4 rounded-xl relative overflow-hidden group hover:border-slate-700 transition">
        <div class="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Likely Bots
        </div>
        <div id="metricBotPercent" class="text-2xl font-bold text-rose-400 mt-1">--%</div>
        <div id="metricBotCount" class="text-[11px] text-slate-400 mt-0.5">-- bot requests</div>
      </div>
    </div>

    <!-- Charts Row: Traffic Timeline & Distribution -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Timeline Chart (2 cols) -->
      <div class="lg:col-span-2 glass rounded-2xl p-5 border border-slate-800">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-sm font-semibold text-white">Traffic Activity: Human vs. Bots</h2>
            <p class="text-xs text-slate-400">Request volume over selected interval</p>
          </div>
          <div class="flex items-center gap-3 text-xs">
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-emerald-500"></span> Human Traffic</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-rose-500"></span> Bot / Threat</span>
          </div>
        </div>
        <div class="h-64">
          <canvas id="timelineChart"></canvas>
        </div>
      </div>

      <!-- Traffic Quality Breakdown (1 col) -->
      <div class="glass rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
        <div>
          <h2 class="text-sm font-semibold text-white mb-1">Traffic Quality & Bot Heuristics</h2>
          <p class="text-xs text-slate-400 mb-4">Classified by Cloudflare Edge Security</p>
          <div class="h-44 relative flex items-center justify-center">
            <canvas id="botDonutChart"></canvas>
          </div>
        </div>
        <div class="space-y-2 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div class="flex justify-between items-center">
            <span class="text-slate-400 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Human Visitors</span>
            <span id="labelHumanCount" class="font-semibold text-slate-200">--</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-400 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-400"></span> Search Crawlers (Google/Bing)</span>
            <span id="labelCrawlerCount" class="font-semibold text-slate-200">--</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-400 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-rose-500"></span> Automated Scrapers / Threats</span>
            <span id="labelThreatCount" class="font-semibold text-slate-200">--</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Traffic Sources Row -->
    <div class="glass rounded-2xl p-5 border border-slate-800">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-sm font-semibold text-white">Traffic Sources</h2>
          <p class="text-xs text-slate-400">Where visitors came from, via Cloudflare Web Analytics (internal navigation excluded; sites without Web Analytics enabled show no data)</p>
        </div>
        <span class="text-xs text-cyan-400 font-medium" id="sourcesTotalBadge">0 visits</span>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <div class="h-44 relative flex items-center justify-center">
            <canvas id="sourcesDonutChart"></canvas>
          </div>
          <div id="sourcesCategoryList" class="space-y-2 mt-4 pt-4 border-t border-slate-800 text-xs"></div>
        </div>
        <div class="lg:col-span-2">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Top Referrers</div>
          <div class="overflow-y-auto max-h-80 divide-y divide-slate-800/60" id="topReferrersList">
            <div class="py-6 text-center text-xs text-slate-500">Loading traffic sources...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Media Leaderboards & Downloads Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <!-- 1. Most Popular Songs -->
      <div class="glass rounded-2xl p-5 border border-slate-800 flex flex-col">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-white">Most Popular Songs</h3>
              <p class="text-xs text-slate-400">Audio plays across Ghost &amp; R2</p>
            </div>
          </div>
          <span class="text-xs text-purple-400 font-medium" id="audioTotalBadge">0 plays</span>
        </div>
        <div class="overflow-y-auto max-h-72 flex-1 divide-y divide-slate-800/60" id="topSongsList">
          <div class="py-6 text-center text-xs text-slate-500">Loading audio analytics...</div>
        </div>
        <div class="pt-3 mt-auto border-t border-slate-800/60 flex items-center justify-between text-xs">
          <span class="text-slate-500 text-[11px]" id="songsCountLabel">-- songs</span>
          <button id="viewAllSongsBtn" class="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition">
            See All Songs &rarr;
          </button>
        </div>
      </div>

      <!-- 2. Most Popular Videos -->
      <div class="glass rounded-2xl p-5 border border-slate-800 flex flex-col">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-white">Most Popular Videos</h3>
              <p class="text-xs text-slate-400">Ghost video cards &amp; Edge</p>
            </div>
          </div>
          <span class="text-xs text-blue-400 font-medium" id="videoTotalBadge">0 plays</span>
        </div>
        <div class="overflow-y-auto max-h-72 flex-1 divide-y divide-slate-800/60" id="topVideosList">
          <div class="py-6 text-center text-xs text-slate-500">Loading video analytics...</div>
        </div>
        <div class="pt-3 mt-auto border-t border-slate-800/60 flex items-center justify-between text-xs">
          <span class="text-slate-500 text-[11px]" id="videosCountLabel">-- videos</span>
          <button id="viewAllVideosBtn" class="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition">
            See All Videos &rarr;
          </button>
        </div>
      </div>

      <!-- 3. Most Popular Games -->
      <div class="glass rounded-2xl p-5 border border-slate-800 flex flex-col">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-white">Most Popular Games</h3>
              <p class="text-xs text-slate-400">Browser plays on kids /games</p>
            </div>
          </div>
          <span class="text-xs text-amber-400 font-medium" id="gameTotalBadge">0 plays</span>
        </div>
        <div class="overflow-y-auto max-h-72 flex-1 divide-y divide-slate-800/60" id="topGamesList">
          <div class="py-6 text-center text-xs text-slate-500">Loading game analytics...</div>
        </div>
        <div class="pt-3 mt-auto border-t border-slate-800/60 flex items-center justify-between text-xs">
          <span class="text-slate-500 text-[11px]" id="gamesCountLabel">-- games</span>
          <button id="viewAllGamesBtn" class="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition">
            See All Games &rarr;
          </button>
        </div>
      </div>

      <!-- 4. Top Downloads -->
      <div class="glass rounded-2xl p-5 border border-slate-800 flex flex-col">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-white">Top Downloads</h3>
              <p class="text-xs text-slate-400">PDFs, Zips, &amp; Assets</p>
            </div>
          </div>
          <span class="text-xs text-emerald-400 font-medium" id="downloadsTotalBadge">0 dl</span>
        </div>
        <div class="overflow-y-auto max-h-72 flex-1 divide-y divide-slate-800/60" id="topDownloadsList">
          <div class="py-6 text-center text-xs text-slate-500">Loading downloads analytics...</div>
        </div>
        <div class="pt-3 mt-auto border-t border-slate-800/60 flex items-center justify-between text-xs">
          <span class="text-slate-500 text-[11px]" id="downloadsCountLabel">-- files</span>
          <button id="viewAllDownloadsBtn" class="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition">
            See All Downloads &rarr;
          </button>
        </div>
      </div>

    </div>

    <!-- Network Sites Overview Table -->
    <div class="glass rounded-2xl p-5 border border-slate-800">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-sm font-semibold text-white">Cross-Site Breakdown &amp; Health</h2>
          <p class="text-xs text-slate-400">Performance comparison across all 11 monitored target domains</p>
        </div>
        <span class="text-xs text-slate-400" id="lastUpdated">Updated just now</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <th class="py-3 px-3">Site / Target</th>
              <th class="py-3 px-3">Host Type</th>
              <th class="py-3 px-3 text-right">Page Views</th>
              <th class="py-3 px-3 text-right">Unique Visitors</th>
              <th class="py-3 px-3 text-right">Song Plays</th>
              <th class="py-3 px-3 text-right">Video Plays</th>
              <th class="py-3 px-3 text-right">Game Plays</th>
              <th class="py-3 px-3 text-right">Downloads</th>
              <th class="py-3 px-3 text-right">Bot %</th>
              <th class="py-3 px-3 text-right">Traffic Share</th>
            </tr>
          </thead>
          <tbody id="sitesTableBody" class="divide-y divide-slate-800/60">
            <tr><td colspan="10" class="py-8 text-center text-slate-500">Fetching network sites...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <!-- Setup & Configuration Modal -->
  <div id="setupModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="glass max-w-2xl w-full rounded-2xl border border-slate-700 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-lg bg-orange-500/10 text-orange-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
          </div>
          <h2 class="text-base font-bold text-white">Dashboard Integration & Setup</h2>
        </div>
        <button id="closeSetupBtn" class="text-slate-400 hover:text-white p-1">&times;</button>
      </div>

      <!-- Cloudflare Free & Shalonely filter notes -->
      <div class="space-y-3 text-xs text-slate-300">
        <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
          <h4 class="font-semibold text-orange-400 mb-1">1. Cloudflare GraphQL & Zone Auto-Discovery</h4>
          <p class="text-slate-400">
            This dashboard uses Cloudflare's GraphQL API across your 9 zones. The Worker auto-discovers zone IDs for all domains using your single API Token.
          </p>
          <p class="text-slate-400 mt-1">
            <strong>Naked Domain Isolation:</strong> For <code>shalonely.com</code>, all requests are strictly filtered to <code>clientRequestHTTPHost == 'shalonely.com'</code>, ensuring subdomains are completely excluded from counts.
          </p>
        </div>

        <!-- Ghost Code Injection Snippet -->
        <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
          <div class="flex items-center justify-between mb-1">
            <h4 class="font-semibold text-purple-400">2. Ghost Video, Game, Download &amp; Page Tracker</h4>
            <button onclick="copySnippet()" class="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">Copy Code</button>
          </div>
          <p class="text-slate-400 mb-2">
            Paste this snippet into <strong>Ghost Admin &rarr; Settings &rarr; Code Injection &rarr; Site Footer</strong> on <code>kids</code> and <code>courses</code> (and <code>sdcason</code> if desired). It tracks page views, Ghost audio/video cards (ignoring Lottie JSON), PICO-8 game iframes, and file downloads while ignoring Ghost Admin.
          </p>
          <pre id="snippetCode" class="p-2.5 bg-black/60 rounded text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre">&lt;script&gt;
// Cloudflare Unified Media, Game &amp; Page Tracker (1.4KB)
(function(){
  if (document.cookie.indexOf('ghost-admin') !== -1 || window.location.pathname.indexOf('/ghost/') !== -1) return;
  var endpoint = 'https://dashboard.methodiusmedia.com/api/track';
  var host = window.location.hostname;
  var dec = function(s){ try { return decodeURIComponent(s); } catch (e) { return s; } };
  var send = function(data){
    data.host = host;
    navigator.sendBeacon(endpoint, JSON.stringify(data));
  };
  send({ type: 'page_view', url: window.location.pathname, title: '_total' });
  document.addEventListener('play', function(e){
    var tag = (e.target &amp;&amp; e.target.tagName || '').toLowerCase();
    if (tag !== 'audio' &amp;&amp; tag !== 'video') return;
    var src = e.target.currentSrc || e.target.src;
    if (!src || /\\.json($|\\?)/i.test(src)) return;
    send({
      type: tag === 'audio' ? 'song_play' : 'video_play',
      url: src,
      title: e.target.getAttribute('title') || dec(src.split('/').pop().split('?')[0])
    });
  }, true);
  var seen = {};
  function markIframe(fr){
    if (!fr || fr.tagName !== 'IFRAME') return;
    var src = fr.getAttribute('src') || '';
    if (!src) return;
    var isGame = /\\/assets\\/games\\/|games\\.methodiusmedia\\.com/i.test(src) || !!fr.closest('.game-cabinet');
    var isVid = /youtube\\.com|youtu\\.be|vimeo\\.com|videodelivery\\.net|cloudflarestream\\.com|mediadelivery\\.net/i.test(src);
    if (!isGame &amp;&amp; !isVid) return;
    var title = fr.getAttribute('title') || src.split('/').pop().split('?')[0].replace(/\\.html?$/i, '');
    var key = (isGame ? 'game:' : 'vid:') + title;
    if (seen[key]) return;
    seen[key] = true;
    send({ type: isGame ? 'game_play' : 'video_play', url: src, title: title });
  }
  window.addEventListener('blur', function(){
    setTimeout(function(){
      if (document.activeElement &amp;&amp; document.activeElement.tagName === 'IFRAME') markIframe(document.activeElement);
    }, 50);
  });
  document.querySelectorAll('.game-cabinet iframe, iframe[src*="/assets/games/"]').forEach(function(fr){
    function hook(){
      try {
        var doc = fr.contentDocument;
        if (!doc) return;
        ['pointerdown', 'keydown'].forEach(function(ev){
          doc.addEventListener(ev, function(){ markIframe(fr); }, { once: true, capture: true });
        });
      } catch (e) {}
    }
    fr.addEventListener('load', hook);
    hook();
  });
  document.addEventListener('click', function(e){
    var a = e.target.closest('a');
    if (!a || !a.href) return;
    if (a.hasAttribute('download') || /\\.(pdf|zip|epub|mobi|dmg|mp3|mp4)($|\\?)/i.test(a.href)) {
      var dl = a.getAttribute('download');
      var fn = dec(a.href.split('/').pop().split('?')[0] || '');
      send({
        type: 'download',
        url: a.href,
        title: (dl &amp;&amp; dl !== 'true') ? dl : (fn || a.innerText.trim())
      });
    }
  }, true);
})();
&lt;/script&gt;</pre>
        </div>

        <!-- IP Exclusion Section -->
        <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
          <div class="flex items-center justify-between mb-1">
            <h4 class="font-semibold text-emerald-400">3. Excluded IP Addresses (Testing Networks)</h4>
            <span class="text-[10px] text-slate-400" id="currentIpLabel">Detecting IP...</span>
          </div>
          <p class="text-slate-400 mb-2">
            Plays, downloads, and pageviews from these IPs are automatically omitted from all leaderboard rankings and analytics.
          </p>
          <div id="excludedIpsList" class="space-y-1.5 mb-2 max-h-28 overflow-y-auto">
            <div class="text-[11px] text-slate-500 italic">No IPs excluded yet.</div>
          </div>
          <div class="flex gap-2">
            <input type="text" id="manualIpInput" placeholder="Add IP (e.g. 192.0.2.1)" class="bg-slate-950 border border-slate-700 text-xs text-white rounded px-2.5 py-1 flex-1 focus:outline-none focus:border-emerald-500 font-mono">
            <button id="addManualIpBtn" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded font-medium transition">Add IP</button>
          </div>
        </div>

        <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
          <h4 class="font-semibold text-blue-400 mb-1">4. Cloudflare R2 Bucket Analytics</h4>
          <p class="text-slate-400">
            When songs, videos, or PDFs are served from Cloudflare R2 buckets, the dashboard queries <code>r2OperationsAdaptiveGroups</code> to aggregate downloads and media plays directly without needing any client-side JavaScript.
          </p>
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <button id="closeSetupBtn2" class="px-4 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-white hover:bg-slate-700">Close</button>
      </div>
    </div>
  </div>

  <!-- Media Explorer Modal (View All Songs / Videos / Downloads) -->
  <div id="mediaModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="glass max-w-4xl w-full rounded-2xl border border-slate-700 p-6 space-y-4 max-h-[90vh] flex flex-col">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
        <div class="flex items-center gap-2.5">
          <div id="mediaModalIcon" class="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
          </div>
          <div>
            <h2 id="mediaModalTitle" class="text-base font-bold text-white">All Media Entries</h2>
            <p id="mediaModalSubtitle" class="text-xs text-slate-400">Showing all recorded requests for current filter</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button id="exportCsvBtn" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 transition">
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
          <button id="closeMediaModalBtn" class="text-slate-400 hover:text-white p-1 text-xl leading-none">&times;</button>
        </div>
      </div>

      <!-- Search bar & Count badge -->
      <div class="flex items-center justify-between gap-4 flex-shrink-0">
        <div class="relative flex-1 max-w-md">
          <input type="text" id="mediaSearchInput" placeholder="Filter by title, filename, or host..." class="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 pl-8 focus:outline-none focus:border-purple-500">
          <svg class="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <span id="mediaModalCountBadge" class="text-xs text-slate-400 font-medium">0 items</span>
      </div>

      <!-- Scrollable Table -->
      <div class="overflow-y-auto flex-1 border border-slate-800 rounded-xl bg-slate-950/60 min-h-[280px]">
        <table class="w-full text-left text-xs">
          <thead class="sticky top-0 bg-slate-900/90 backdrop-blur border-b border-slate-800 text-slate-400 uppercase tracking-wider">
            <tr>
              <th class="py-2.5 px-3 w-12 text-center">#</th>
              <th class="py-2.5 px-3">Title / Filename</th>
              <th class="py-2.5 px-3">Site / Host</th>
              <th class="py-2.5 px-3 text-right" id="mediaTableCountColHeader">Plays</th>
              <th class="py-2.5 px-3 text-right">Bandwidth</th>
              <th class="py-2.5 px-3">Source</th>
            </tr>
          </thead>
          <tbody id="mediaModalTableBody" class="divide-y divide-slate-800/60">
            <!-- Dynamic rows -->
          </tbody>
        </table>
      </div>

      <!-- Modal Footer -->
      <div class="flex justify-between items-center pt-2 flex-shrink-0 text-xs text-slate-500">
        <span id="mediaModalFooterNotes">Real-time edge data filtered by active time interval & excluded IPs</span>
        <button id="closeMediaModalBtn2" class="px-4 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-white hover:bg-slate-700">Close</button>
      </div>
    </div>
  </div>

  <!-- Dashboard JavaScript Application -->
  <script>
    let timelineChart = null;
    let botDonutChart = null;
    let currentRange = '7d';
    let currentSite = 'all';

    // Elements
    const siteSelect = document.getElementById('siteFilter');
    const refreshBtn = document.getElementById('refreshBtn');
    const refreshIcon = document.getElementById('refreshIcon');
    const statusAlert = document.getElementById('statusAlert');
    const setupModal = document.getElementById('setupModal');

    // Modal controls
    document.getElementById('openSetupBtn').onclick = () => setupModal.classList.remove('hidden');
    document.getElementById('closeSetupBtn').onclick = () => setupModal.classList.add('hidden');
    document.getElementById('closeSetupBtn2').onclick = () => setupModal.classList.add('hidden');

    function copySnippet() {
      const code = document.getElementById('snippetCode').innerText;
      navigator.clipboard.writeText(code).then(() => {
        alert('Tracker snippet copied to clipboard! Paste into Ghost Admin -> Settings -> Code Injection -> Site Footer.');
      });
    }

    // Range buttons
    document.querySelectorAll('.range-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.range-btn').forEach(b => {
          b.classList.remove('bg-orange-500', 'text-white', 'shadow-sm');
          b.classList.add('text-slate-400');
        });
        btn.classList.add('bg-orange-500', 'text-white', 'shadow-sm');
        btn.classList.remove('text-slate-400');
        currentRange = btn.dataset.range;
        loadData();
      };
    });

    siteSelect.onchange = () => {
      currentSite = siteSelect.value;
      loadData();
    };

    refreshBtn.onclick = () => loadData();

    function formatNumber(num) {
      if (num === undefined || num === null) return '--';
      return new Intl.NumberFormat().format(num);
    }

    function formatBytes(bytes) {
      if (!bytes || bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    async function loadData() {
      refreshIcon.classList.add('animate-spin');
      statusAlert.classList.add('hidden');

      try {
        const res = await fetch('/api/stats?range=' + currentRange + '&site=' + currentSite);
        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || 'Failed to load data');
        }

        renderMetrics(data);
        renderCharts(data);
        renderMediaLists(data);
        renderTrafficSources(data);
        renderSitesTable(data);
        document.getElementById('lastUpdated').innerText = 'Updated ' + new Date().toLocaleTimeString();

        if (data.warning) {
          statusAlert.className = 'rounded-xl p-3 border text-xs bg-amber-950/40 border-amber-800 text-amber-300 flex items-center gap-2';
          statusAlert.innerHTML = '<svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg> <span>' + data.warning + '</span>';
          statusAlert.classList.remove('hidden');
        }
      } catch (err) {
        statusAlert.className = 'rounded-xl p-3 border text-xs bg-rose-950/40 border-rose-800 text-rose-300 flex items-center gap-2';
        statusAlert.innerHTML = '<svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg> <span><strong>Error:</strong> ' + err.message + '</span>';
        statusAlert.classList.remove('hidden');
      } finally {
        refreshIcon.classList.remove('animate-spin');
      }
    }

    function renderMetrics(data) {
      const totals = data.totals || {};
      document.getElementById('metricVisits').innerText = formatNumber(totals.pageViews || totals.requests || 0);
      document.getElementById('metricPageViews').innerText = formatNumber(totals.pageViews || 0) + ' page views';
      document.getElementById('metricUniques').innerText = formatNumber(totals.uniques || totals.estimatedVisitors || 0);
      document.getElementById('metricSongPlays').innerText = formatNumber(totals.songPlays || 0);
      document.getElementById('metricVideoPlays').innerText = formatNumber(totals.videoPlays || 0);
      document.getElementById('metricGamePlays').innerText = formatNumber(totals.gamePlays || 0);
      document.getElementById('metricDownloads').innerText = formatNumber(totals.downloads || 0);

      const botRatio = totals.botPercent || 0;
      document.getElementById('metricBotPercent').innerText = botRatio.toFixed(1) + '%';
      document.getElementById('metricBotCount').innerText = formatNumber(totals.threats || 0) + ' bot / threat reqs';

      document.getElementById('labelHumanCount').innerText = formatNumber(totals.humanRequests || (totals.requests - totals.threats) || 0);
      document.getElementById('labelCrawlerCount').innerText = formatNumber(totals.crawlerRequests || Math.round((totals.threats || 0) * 0.4));
      document.getElementById('labelThreatCount').innerText = formatNumber(totals.threatRequests || Math.round((totals.threats || 0) * 0.6));

      document.getElementById('audioTotalBadge').innerText = formatNumber(totals.songPlays || 0) + ' plays';
      document.getElementById('videoTotalBadge').innerText = formatNumber(totals.videoPlays || 0) + ' plays';
      document.getElementById('gameTotalBadge').innerText = formatNumber(totals.gamePlays || 0) + ' plays';
      document.getElementById('downloadsTotalBadge').innerText = formatNumber(totals.downloads || 0) + ' dl';
    }

    function renderCharts(data) {
      // 1. Timeline Chart
      const timeline = data.timeline || [];
      const labels = timeline.map(t => t.time);
      const humanData = timeline.map(t => t.human);
      const botData = timeline.map(t => t.threats);

      const ctxTimeline = document.getElementById('timelineChart').getContext('2d');
      if (timelineChart) timelineChart.destroy();

      timelineChart = new Chart(ctxTimeline, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Human Requests',
              data: humanData,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.3,
              borderWidth: 2,
              pointRadius: labels.length > 30 ? 0 : 2
            },
            {
              label: 'Likely Bots / Threats',
              data: botData,
              borderColor: '#f43f5e',
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              fill: true,
              tension: 0.3,
              borderWidth: 2,
              pointRadius: labels.length > 30 ? 0 : 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#64748b', maxTicksLimit: 8 }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#64748b' }
            }
          }
        }
      });

      // 2. Donut Chart
      const ctxDonut = document.getElementById('botDonutChart').getContext('2d');
      if (botDonutChart) botDonutChart.destroy();

      const totals = data.totals || {};
      const human = totals.humanRequests || (totals.requests - (totals.threats || 0));
      const crawler = totals.crawlerRequests || Math.round((totals.threats || 0) * 0.4);
      const threat = totals.threatRequests || Math.round((totals.threats || 0) * 0.6);

      botDonutChart = new Chart(ctxDonut, {
        type: 'doughnut',
        data: {
          labels: ['Human', 'Crawlers', 'Bots/Threats'],
          datasets: [{
            data: [human, crawler, threat],
            backgroundColor: ['#10b981', '#f59e0b', '#f43f5e'],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          cutout: '72%'
        }
      });
    }

    let cachedAllMedia = {
      songs: [],
      videos: [],
      games: [],
      downloads: []
    };

    function renderLeaderboardRows(containerId, items, emptyMsg, siteClass, valClass, countKey, metaLabelFn) {
      const el = document.getElementById(containerId);
      if (!items || items.length === 0) {
        el.innerHTML = '<div class="py-8 text-center text-xs text-slate-500">' + escapeHtml(emptyMsg) + '</div>';
        return;
      }
      el.innerHTML = items.map((item, idx) => {
        const title = escapeHtml(item.title || '');
        const site = escapeHtml(item.site || '');
        const meta = escapeHtml(metaLabelFn(item));
        return \`
          <div class="py-2.5 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2.5 min-w-0 pr-2">
              <span class="w-5 text-slate-500 font-bold text-center">\${idx + 1}</span>
              <div class="min-w-0">
                <div class="font-medium text-slate-200 truncate" title="\${title}">\${title}</div>
                <div class="text-[10px] text-slate-400 flex items-center gap-1.5">
                  <span class="\${siteClass}">\${site}</span> &bull; <span>\${meta}</span>
                </div>
              </div>
            </div>
            <div class="text-right flex-shrink-0">
              <div class="font-semibold \${valClass}">\${formatNumber(item[countKey] || 0)}</div>
              <div class="text-[10px] text-slate-400">\${formatBytes(item.bytes)}</div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function renderMediaLists(data) {
      cachedAllMedia.songs = data.allSongs || data.topSongs || [];
      cachedAllMedia.videos = data.allVideos || data.topVideos || [];
      cachedAllMedia.games = data.allGames || data.topGames || [];
      cachedAllMedia.downloads = data.allDownloads || data.topDownloads || [];

      document.getElementById('songsCountLabel').innerText = cachedAllMedia.songs.length + ' songs';
      document.getElementById('videosCountLabel').innerText = cachedAllMedia.videos.length + ' videos';
      document.getElementById('gamesCountLabel').innerText = cachedAllMedia.games.length + ' games';
      document.getElementById('downloadsCountLabel').innerText = cachedAllMedia.downloads.length + ' files';

      renderLeaderboardRows('topSongsList', data.topSongs || [], 'No song plays recorded yet for this period.', 'text-purple-400', 'text-purple-300', 'plays', s => s.source || 'Ghost / R2');
      renderLeaderboardRows('topVideosList', data.topVideos || [], 'No video plays recorded yet for this period.', 'text-blue-400', 'text-blue-300', 'plays', v => v.source || 'Ghost / R2');
      renderLeaderboardRows('topGamesList', data.topGames || [], 'No game plays recorded yet for this period.', 'text-amber-400', 'text-amber-300', 'plays', g => g.source || 'Ghost / Beacon');
      renderLeaderboardRows('topDownloadsList', data.topDownloads || [], 'No file downloads recorded yet.', 'text-emerald-400', 'text-emerald-300', 'downloads', d => (d.ext || 'FILE').toUpperCase());
    }

    let sourcesDonutChart = null;
    const SOURCE_COLORS = {
      'Search': '#22d3ee',
      'Social': '#a78bfa',
      'Direct / None': '#94a3b8',
      'Referral': '#f59e0b',
      'Email / Newsletter': '#34d399',
      'AI Assistants': '#f472b6'
    };

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function renderTrafficSources(data) {
      const ts = data.trafficSources || { total: 0, categories: [], topReferrers: [] };
      const total = ts.total || 0;
      document.getElementById('sourcesTotalBadge').innerText = formatNumber(total) + ' visits';

      const cats = ts.categories || [];
      const ctx = document.getElementById('sourcesDonutChart').getContext('2d');
      if (sourcesDonutChart) sourcesDonutChart.destroy();
      sourcesDonutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: cats.map(c => c.name),
          datasets: [{
            data: cats.map(c => c.visits),
            backgroundColor: cats.map(c => SOURCE_COLORS[c.name] || '#64748b'),
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '72%' }
      });

      const catList = document.getElementById('sourcesCategoryList');
      catList.innerHTML = cats.length === 0
        ? '<div class="text-center text-slate-500">No source data for this period.</div>'
        : cats.map(c => {
            const pct = total > 0 ? ((c.visits / total) * 100).toFixed(1) : '0.0';
            return '<div class="flex justify-between items-center">' +
              '<span class="text-slate-400 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full" style="background:' + (SOURCE_COLORS[c.name] || '#64748b') + '"></span> ' + escapeHtml(c.name) + '</span>' +
              '<span class="font-semibold text-slate-200">' + formatNumber(c.visits) + ' <span class="text-slate-500 font-normal">(' + pct + '%)</span></span>' +
            '</div>';
          }).join('');

      const refList = document.getElementById('topReferrersList');
      const refs = ts.topReferrers || [];
      if (refs.length === 0) {
        refList.innerHTML = '<div class="py-8 text-center text-xs text-slate-500">' +
          (ts.error ? 'Traffic source data unavailable: ' + escapeHtml(ts.error) : 'No referrer data recorded yet for this period.') + '</div>';
        return;
      }
      const maxVisits = refs[0].visits || 1;
      refList.innerHTML = refs.map((r, idx) => {
        const color = SOURCE_COLORS[r.category] || '#64748b';
        const width = Math.max(2, (r.visits / maxVisits) * 100).toFixed(1);
        return '<div class="py-2 flex items-center justify-between text-xs gap-3">' +
          '<div class="flex items-center gap-2.5 min-w-0 flex-1">' +
            '<span class="w-5 text-slate-500 font-bold text-center">' + (idx + 1) + '</span>' +
            '<div class="min-w-0 flex-1">' +
              '<div class="font-medium text-slate-200 truncate">' + escapeHtml(r.host) + '</div>' +
              '<div class="text-[10px] text-slate-400 truncate"><span style="color:' + color + '">' + escapeHtml(r.category) + '</span> &bull; ' + escapeHtml((r.sites || []).join(', ')) + '</div>' +
              '<div class="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden"><div class="h-1 rounded-full" style="width:' + width + '%;background:' + color + '"></div></div>' +
            '</div>' +
          '</div>' +
          '<div class="font-semibold text-slate-200 flex-shrink-0">' + formatNumber(r.visits) + '</div>' +
        '</div>';
      }).join('');
    }

    function renderSitesTable(data) {
      const tbody = document.getElementById('sitesTableBody');
      const sites = data.sites || [];
      if (sites.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="py-6 text-center text-slate-500">No site metrics found.</td></tr>';
        return;
      }

      const totalReqs = sites.reduce((acc, s) => acc + (s.pageViews || s.requests || 0), 0) || 1;
      const dash = (hint) => '<span class="text-slate-600" title="' + escapeHtml(hint) + '">\u2014</span>';

      tbody.innerHTML = sites.map(s => {
        const share = (((s.pageViews || s.requests || 0) / totalReqs) * 100).toFixed(1);
        const botPct = (s.botPercent || 0).toFixed(1);
        const hasGames = s.trackGames || (s.gamePlays || 0) > 0;
        return \`
          <tr class="hover:bg-slate-800/40 transition">
            <td class="py-3 px-3">
              <div class="font-semibold text-white">\${escapeHtml(s.name)}</div>
              <div class="text-[11px] text-slate-400">\${escapeHtml(s.domain)}</div>
            </td>
            <td class="py-3 px-3">
              <span class="px-2 py-0.5 rounded text-[10px] font-medium \${s.platform === 'Ghost' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}">
                \${escapeHtml(s.platform || 'Cloudflare')}
              </span>
            </td>
            <td class="py-3 px-3 text-right font-medium text-slate-200">\${formatNumber(s.pageViews || s.requests || 0)}</td>
            <td class="py-3 px-3 text-right text-slate-400">\${formatNumber(s.uniques || s.estimatedVisitors || 0)}</td>
            <td class="py-3 px-3 text-right font-medium text-purple-300">\${s.trackMedia === false ? dash('Media not tracked for this site') : formatNumber(s.songPlays || 0)}</td>
            <td class="py-3 px-3 text-right font-medium text-blue-300">\${s.trackMedia === false ? dash('Media not tracked for this site') : formatNumber(s.videoPlays || 0)}</td>
            <td class="py-3 px-3 text-right font-medium text-amber-300">\${hasGames ? formatNumber(s.gamePlays || 0) : dash('Games not tracked for this site')}</td>
            <td class="py-3 px-3 text-right font-medium text-emerald-300">\${s.trackDownloads === false ? dash('Downloads not tracked for this site') : formatNumber(s.downloads || 0)}</td>
            <td class="py-3 px-3 text-right">
              <span class="\${botPct > 40 ? 'badge-bot' : 'badge-human'} px-1.5 py-0.5 rounded text-[11px] font-medium">
                \${botPct}%
              </span>
            </td>
            <td class="py-3 px-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <span class="text-slate-300 font-medium">\${share}%</span>
                <div class="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-orange-500 h-1.5 rounded-full" style="width: \${share}%"></div>
                </div>
              </div>
            </td>
          </tr>
        \`;
      }).join('');
    }

    // IP Exclusion Management
    let currentClientIp = null;
    let isCurrentIpIgnored = false;

    async function loadIpSettings() {
      try {
        const res = await fetch('/api/ip-settings');
        const data = await res.json();
        currentClientIp = data.clientIp;
        isCurrentIpIgnored = data.isIgnored;
        updateIpButtonUI(data);
        renderExcludedIpsList(data.excludedIps || []);
      } catch (e) {
        console.warn('Could not load IP settings:', e);
      }
    }

    function updateIpButtonUI(data) {
      const btn = document.getElementById('toggleIpBtn');
      const dot = document.getElementById('ipDot');
      const text = document.getElementById('ipBtnText');
      const label = document.getElementById('currentIpLabel');

      if (label) label.innerText = 'Your IP: ' + data.clientIp;

      if (data.isIgnored) {
        btn.className = 'px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-300 hover:bg-emerald-900/60 transition flex items-center gap-1.5';
        dot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
        text.innerText = '\u{1F6E1}\uFE0F My Wi-Fi Ignored (' + data.clientIp + ')';
        btn.title = 'Click to un-ignore this IP and include its plays';
      } else {
        btn.className = 'px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-slate-500 transition flex items-center gap-1.5';
        dot.className = 'w-2 h-2 rounded-full bg-slate-400';
        text.innerText = '\u{1F441}\uFE0F Ignore My Wi-Fi (' + data.clientIp + ')';
        btn.title = 'Click to ignore all traffic and plays from this Wi-Fi network';
      }
    }

    function renderExcludedIpsList(list) {
      const container = document.getElementById('excludedIpsList');
      if (!list || list.length === 0) {
        container.innerHTML = '<div class="text-[11px] text-slate-500 italic">No IPs excluded yet.</div>';
        return;
      }
      container.innerHTML = list.map(ip => \`
        <div class="flex items-center justify-between p-1.5 bg-black/40 rounded border border-slate-800 text-[11px] font-mono text-slate-300">
          <span>\${ip}</span>
          <button onclick="removeIp('\${ip}')" class="text-rose-400 hover:text-rose-300 px-1 py-0.5 rounded text-[10px]">Remove</button>
        </div>
      \`).join('');
    }

    document.getElementById('toggleIpBtn').onclick = async () => {
      if (!currentClientIp) return;
      const action = isCurrentIpIgnored ? 'remove' : 'add';
      const res = await fetch('/api/ip-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: currentClientIp, action })
      });
      const data = await res.json();
      isCurrentIpIgnored = data.isIgnored;
      updateIpButtonUI(data);
      renderExcludedIpsList(data.excludedIps || []);
      loadData();
    };

    window.removeIp = async function(ip) {
      const res = await fetch('/api/ip-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, action: 'remove' })
      });
      const data = await res.json();
      isCurrentIpIgnored = data.isIgnored;
      updateIpButtonUI(data);
      renderExcludedIpsList(data.excludedIps || []);
      loadData();
    };

    document.getElementById('addManualIpBtn').onclick = async () => {
      const input = document.getElementById('manualIpInput');
      const val = (input.value || '').trim();
      if (!val) return;
      const res = await fetch('/api/ip-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: val, action: 'add' })
      });
      const data = await res.json();
      input.value = '';
      isCurrentIpIgnored = data.isIgnored;
      updateIpButtonUI(data);
      renderExcludedIpsList(data.excludedIps || []);
      loadData();
    };

    // Media Explorer Modal Management
    let currentModalType = 'songs'; // 'songs' | 'videos' | 'games' | 'downloads'
    let currentModalItems = [];

    function openMediaExplorer(type) {
      currentModalType = type;
      const modal = document.getElementById('mediaModal');
      const icon = document.getElementById('mediaModalIcon');
      const title = document.getElementById('mediaModalTitle');
      const subtitle = document.getElementById('mediaModalSubtitle');
      const colHeader = document.getElementById('mediaTableCountColHeader');
      const search = document.getElementById('mediaSearchInput');
      search.value = '';

      const siteLabel = document.getElementById('siteFilter').selectedOptions[0]?.text || 'All Sites';
      subtitle.innerText = 'Time Period: Last ' + currentRange + ' \u2022 Filter: ' + siteLabel;

      if (type === 'songs') {
        icon.className = 'p-2 rounded-lg bg-purple-500/10 text-purple-400';
        icon.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>';
        title.innerText = 'All Songs & Audio Plays (' + cachedAllMedia.songs.length + ' entries)';
        colHeader.innerText = 'Plays';
        currentModalItems = cachedAllMedia.songs;
      } else if (type === 'videos') {
        icon.className = 'p-2 rounded-lg bg-blue-500/10 text-blue-400';
        icon.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>';
        title.innerText = 'All Videos & Streaming Requests (' + cachedAllMedia.videos.length + ' entries)';
        colHeader.innerText = 'Plays';
        currentModalItems = cachedAllMedia.videos;
      } else if (type === 'games') {
        icon.className = 'p-2 rounded-lg bg-amber-500/10 text-amber-400';
        icon.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
        title.innerText = 'All Game Plays (' + cachedAllMedia.games.length + ' entries)';
        colHeader.innerText = 'Plays';
        currentModalItems = cachedAllMedia.games;
      } else {
        icon.className = 'p-2 rounded-lg bg-emerald-500/10 text-emerald-400';
        icon.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>';
        title.innerText = 'All Downloads & Asset Requests (' + cachedAllMedia.downloads.length + ' entries)';
        colHeader.innerText = 'Downloads';
        currentModalItems = cachedAllMedia.downloads;
      }

      renderMediaModalTable(currentModalItems);
      modal.classList.remove('hidden');
    }

    function renderMediaModalTable(items) {
      const tbody = document.getElementById('mediaModalTableBody');
      const countBadge = document.getElementById('mediaModalCountBadge');
      countBadge.innerText = items.length + ' items';

      if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="py-12 text-center text-slate-500">No media entries found matching your search.</td></tr>';
        return;
      }

      const isDownload = currentModalType === 'downloads';

      tbody.innerHTML = items.map((item, idx) => {
        const valClass = currentModalType === 'songs' ? 'text-purple-300' : currentModalType === 'videos' ? 'text-blue-300' : currentModalType === 'games' ? 'text-amber-300' : 'text-emerald-300';
        const countVal = formatNumber(isDownload ? item.downloads : item.plays);
        const safeTitle = escapeHtml(item.title || '');
        const safeRaw = escapeHtml(item.rawName || item.title || '');
        const safeSite = escapeHtml(item.site || 'Direct');
        const safeSrc = escapeHtml(item.source || 'Cloudflare Edge');
        return '<tr class="hover:bg-slate-900/60 transition">' +
          '<td class="py-2.5 px-3 text-center text-slate-500 font-bold">' + (idx + 1) + '</td>' +
          '<td class="py-2.5 px-3 font-medium text-slate-200">' +
            '<div class="truncate max-w-md font-semibold text-white" title="' + safeTitle + '">' + safeTitle + '</div>' +
            '<div class="text-[10px] text-slate-400 truncate max-w-md font-mono">' + safeRaw + '</div>' +
          '</td>' +
          '<td class="py-2.5 px-3 text-slate-300">' +
            '<span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700">' + safeSite + '</span>' +
          '</td>' +
          '<td class="py-2.5 px-3 text-right font-bold ' + valClass + '">' + countVal + '</td>' +
          '<td class="py-2.5 px-3 text-right text-slate-400">' + formatBytes(item.bytes) + '</td>' +
          '<td class="py-2.5 px-3 text-[11px] text-slate-400">' + safeSrc + '</td>' +
        '</tr>';
      }).join('');
    }

    document.getElementById('mediaSearchInput').oninput = (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        renderMediaModalTable(currentModalItems);
        return;
      }
      const filtered = currentModalItems.filter(item => 
        (item.title || '').toLowerCase().includes(query) ||
        (item.rawName || '').toLowerCase().includes(query) ||
        (item.site || '').toLowerCase().includes(query)
      );
      renderMediaModalTable(filtered);
    };

    document.getElementById('exportCsvBtn').onclick = () => {
      if (!currentModalItems || currentModalItems.length === 0) return;
      const isDl = currentModalType === 'downloads';
      const headers = ['Rank', 'Title', 'Site', isDl ? 'Downloads' : 'Plays', 'Bytes', 'Source'];
      const rows = currentModalItems.map((item, i) => [
        i + 1,
        '"' + (item.title || '').replace(/"/g, '""') + '"',
        '"' + (item.site || '') + '"',
        isDl ? item.downloads : item.plays,
        item.bytes || 0,
        '"' + (item.source || '') + '"'
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', currentModalType + '_' + currentRange + '_' + new Date().toISOString().slice(0,10) + '.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    document.getElementById('viewAllSongsBtn').onclick = () => openMediaExplorer('songs');
    document.getElementById('viewAllVideosBtn').onclick = () => openMediaExplorer('videos');
    document.getElementById('viewAllGamesBtn').onclick = () => openMediaExplorer('games');
    document.getElementById('viewAllDownloadsBtn').onclick = () => openMediaExplorer('downloads');

    document.getElementById('closeMediaModalBtn').onclick = () => document.getElementById('mediaModal').classList.add('hidden');
    document.getElementById('closeMediaModalBtn2').onclick = () => document.getElementById('mediaModal').classList.add('hidden');

    // Auto load on init
    loadIpSettings();
    loadData();
  <\/script>
</body>
</html>`;
}
__name(getDashboardHtml, "getDashboardHtml");

// src/index.js
var SITES = [
  {
    id: "methodiusmedia",
    name: "methodiusmedia.com",
    domain: "methodiusmedia.com",
    zoneDomain: "methodiusmedia.com",
    matchHosts: ["methodiusmedia.com", "www.methodiusmedia.com"],
    platform: "Cloudflare",
    type: "root"
  },
  {
    id: "courses-methodiusmedia",
    name: "courses.methodiusmedia.com",
    domain: "courses.methodiusmedia.com",
    zoneDomain: "methodiusmedia.com",
    matchHosts: ["courses.methodiusmedia.com"],
    platform: "Ghost",
    type: "subdomain"
  },
  {
    id: "illuminatedrosary",
    name: "illuminatedrosary.com",
    domain: "illuminatedrosary.com",
    zoneDomain: "illuminatedrosary.com",
    matchHosts: ["illuminatedrosary.com", "www.illuminatedrosary.com"],
    platform: "Cloudflare",
    type: "root"
  },
  {
    id: "sdcason",
    name: "sdcason.com",
    domain: "sdcason.com",
    zoneDomain: "sdcason.com",
    matchHosts: ["sdcason.com", "www.sdcason.com"],
    platform: "Ghost",
    type: "root",
    trackMedia: false
    // visits & downloads only — no song/video play tracking
  },
  {
    id: "catholicsketchbook",
    name: "catholicsketchbook.com",
    domain: "catholicsketchbook.com",
    zoneDomain: "catholicsketchbook.com",
    matchHosts: ["catholicsketchbook.com", "www.catholicsketchbook.com", "media.catholicsketchbook.com"],
    platform: "Cloudflare",
    type: "root",
    trackMedia: false
    // visits & downloads only — no song/video play tracking
  },
  {
    id: "methodius-media",
    name: "methodius.media",
    domain: "methodius.media",
    zoneDomain: "methodius.media",
    matchHosts: ["methodius.media", "www.methodius.media", "media.methodius.media"],
    r2Buckets: ["methodius"],
    platform: "Cloudflare",
    type: "root"
  },
  {
    id: "catholiclofi",
    name: "catholiclofi.com",
    domain: "catholiclofi.com",
    zoneDomain: "catholiclofi.com",
    matchHosts: ["catholiclofi.com", "www.catholiclofi.com", "media.catholiclofi.com"],
    r2Buckets: ["catholiclofi-media"],
    platform: "Cloudflare",
    type: "root"
  },
  {
    id: "shalonely",
    name: "shalonely.com",
    domain: "shalonely.com",
    zoneDomain: "shalonely.com",
    // Matches naked/www + daily.shalonely.com (the R2 audio/archive bucket for shalonely.com), ignoring all other subdomains!
    matchHosts: ["shalonely.com", "www.shalonely.com", "daily.shalonely.com"],
    r2Buckets: ["dailybeats-media"],
    platform: "Cloudflare",
    type: "naked_only"
  },
  {
    id: "picoparish",
    name: "picoparish.com",
    domain: "picoparish.com",
    zoneDomain: "picoparish.com",
    matchHosts: ["picoparish.com", "www.picoparish.com"],
    platform: "Cloudflare",
    type: "root",
    trackMedia: false
    // visits & downloads only — no song/video play tracking
  },
  {
    id: "angelio",
    name: "angelio.org",
    domain: "angelio.org",
    zoneDomain: "angelio.org",
    matchHosts: ["angelio.org", "www.angelio.org"],
    // Watch & Sing videos, songs and PDFs (angelio.org/watch/media/…) live in this bucket.
    r2Buckets: ["watch-media"],
    platform: "Cloudflare",
    type: "root"
  }
];
var ALLOWED_TRACK_TYPES = /* @__PURE__ */ new Set(["song_play", "video_play", "download", "game_play", "page_view"]);
function safeDecode(str) {
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
}
__name(safeDecode, "safeDecode");
function isLottieAsset(str) {
  const s = (str || "").toLowerCase();
  return s.endsWith(".json") || s.includes(".json?") || /^lf20_/i.test(s);
}
__name(isLottieAsset, "isLottieAsset");
function cleanTrackTitle(type, rawTitle, targetUrl) {
  let title = String(rawTitle || "").trim();
  const urlPath = String(targetUrl || "").split("?")[0];
  const urlFile = safeDecode(urlPath.split("/").pop() || "");
  if (type === "page_view") {
    return "_total";
  }
  if (type === "download") {
    const isGeneric = !title || /[\r\n]/.test(title) || /^(download\b|free download|⬇)/i.test(title);
    if (isGeneric && urlFile) {
      title = urlFile;
    } else if (/[\r\n]/.test(title)) {
      const lines = title.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
      const best = lines.find((l) => !/^(free download|this image is in the public domain)/i.test(l));
      if (best) title = best.replace(/\s+\d+(\.\d+)?\s*(kb|mb|gb|bytes)$/i, "").trim();
    }
  } else if (type === "game_play") {
    if (!title && urlFile) {
      title = urlFile.replace(/\.html?$/i, "");
    }
  } else if (!title && urlFile) {
    title = urlFile;
  }
  return (title || "untitled").slice(0, 180);
}
__name(cleanTrackTitle, "cleanTrackTitle");
var index_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (env.DASHBOARD_PASSWORD && env.DASHBOARD_PASSWORD.trim() !== "") {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Basic ")) {
        return new Response("Unauthorized", {
          status: 401,
          headers: { "WWW-Authenticate": 'Basic realm="Cloudflare Analytics Dashboard"' }
        });
      }
      const decoded = atob(authHeader.split(" ")[1]);
      const [, pass] = decoded.split(":");
      if (pass !== env.DASHBOARD_PASSWORD) {
        return new Response("Forbidden", { status: 403 });
      }
    }
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(getDashboardHtml(), {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }
    if (url.pathname === "/api/ip-settings" && request.method === "GET") {
      const clientIp = request.headers.get("CF-Connecting-IP") || "127.0.0.1";
      let excludedIps = [];
      if (env.MEDIA_STATS && typeof env.MEDIA_STATS.get === "function") {
        try {
          const raw = await env.MEDIA_STATS.get("config:excluded_ips");
          if (raw) excludedIps = JSON.parse(raw);
        } catch (e) {
        }
      }
      return new Response(JSON.stringify({
        clientIp,
        isIgnored: excludedIps.includes(clientIp),
        excludedIps
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (url.pathname === "/api/ip-settings" && request.method === "POST") {
      try {
        const body = await request.json();
        const { ip, action } = body;
        if (!ip) throw new Error("IP is required");
        let excludedIps = [];
        if (env.MEDIA_STATS && typeof env.MEDIA_STATS.get === "function") {
          try {
            const raw = await env.MEDIA_STATS.get("config:excluded_ips");
            if (raw) excludedIps = JSON.parse(raw);
          } catch (e) {
          }
          if (action === "add" && !excludedIps.includes(ip)) {
            excludedIps.push(ip);
          } else if (action === "remove") {
            excludedIps = excludedIps.filter((item) => item !== ip);
          }
          await env.MEDIA_STATS.put("config:excluded_ips", JSON.stringify(excludedIps));
        }
        const clientIp = request.headers.get("CF-Connecting-IP") || "127.0.0.1";
        return new Response(JSON.stringify({
          success: true,
          clientIp,
          isIgnored: excludedIps.includes(clientIp),
          excludedIps
        }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    if (url.pathname === "/api/stats") {
      const range = url.searchParams.get("range") || "7d";
      const siteFilter = url.searchParams.get("site") || "all";
      const token = env.CLOUDFLARE_API_TOKEN;
      if (!token) {
        return new Response(JSON.stringify(generateMockData(range, siteFilter)), {
          headers: { "Content-Type": "application/json" }
        });
      }
      try {
        const stats = await fetchLiveCloudflareData(token, env, range, siteFilter);
        return new Response(JSON.stringify(stats), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        console.error("Cloudflare API error:", err);
        return new Response(JSON.stringify({
          error: err.message,
          warning: "Falling back to simulated data due to API error: " + err.message,
          ...generateMockData(range, siteFilter)
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    if (url.pathname === "/api/track" && request.method === "POST") {
      try {
        const payload = await request.json();
        const { type, url: targetUrl, title, host } = payload;
        const clientIp = request.headers.get("CF-Connecting-IP") || "";
        if (!ALLOWED_TRACK_TYPES.has(type)) {
          return new Response(JSON.stringify({ error: "Unsupported event type" }), {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }
        const cleanHost = (host || "").split(":")[0].toLowerCase();
        const matchedSite = SITES.find((s) => s.matchHosts.includes(cleanHost));
        if (!matchedSite) {
          return new Response(JSON.stringify({ success: true, ignored: true }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }
        if ((type === "video_play" || type === "song_play") && (isLottieAsset(targetUrl) || isLottieAsset(title))) {
          return new Response(JSON.stringify({ success: true, ignored: true }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }
        if (env.MEDIA_STATS && typeof env.MEDIA_STATS.get === "function") {
          let excludedIps = [];
          try {
            const raw = await env.MEDIA_STATS.get("config:excluded_ips");
            if (raw) excludedIps = JSON.parse(raw);
          } catch (e) {
          }
          if (clientIp && excludedIps.includes(clientIp)) {
            return new Response(JSON.stringify({ success: true, ignored: true }), {
              headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });
          }
          const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
          const normalizedTitle = cleanTrackTitle(type, title, targetUrl);
          const cleanTitle = encodeURIComponent(normalizedTitle);
          const key = `event:${date}:${cleanHost}:${type}:${cleanTitle}`;
          const current = parseInt(await env.MEDIA_STATS.get(key) || "0", 10) || 0;
          const next = current + 1;
          await env.MEDIA_STATS.put(key, next.toString(), {
            expirationTtl: 60 * 60 * 24 * 60,
            metadata: { count: next }
          });
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
    }
    if (url.pathname === "/api/track" && request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    return new Response("Not Found", { status: 404 });
  }
};
async function fetchLiveCloudflareData(token, env, range, siteFilter) {
  const now = /* @__PURE__ */ new Date();
  const days = range === "24h" ? 1 : range === "30d" ? 28 : 7;
  const sinceDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1e3);
  const sinceIso = sinceDate.toISOString();
  const untilIso = now.toISOString();
  const zonesMap = await getZonesMap(token);
  const zoneTagsToQuery = /* @__PURE__ */ new Set();
  SITES.forEach((s) => {
    if (zonesMap[s.zoneDomain]) {
      zoneTagsToQuery.add(zonesMap[s.zoneDomain]);
    }
  });
  if (zoneTagsToQuery.size === 0) {
    throw new Error("None of the configured domains were found in your Cloudflare account. Check your API Token permissions.");
  }
  let excludedIps = [];
  if (env.MEDIA_STATS && typeof env.MEDIA_STATS.get === "function") {
    try {
      const raw = await env.MEDIA_STATS.get("config:excluded_ips");
      if (raw) excludedIps = JSON.parse(raw);
    } catch (e) {
    }
  }
  const allMatchHosts = Array.from(new Set(SITES.flatMap((s) => s.matchHosts)));
  let accountId = env.CLOUDFLARE_ACCOUNT_ID;
  if (!accountId) {
    accountId = await getAccountId(token);
  }
  const [zoneStats, r2Data, kvEvents] = await Promise.all([
    queryZoneAdaptiveAnalytics(token, Array.from(zoneTagsToQuery), sinceIso, untilIso, excludedIps, allMatchHosts),
    accountId ? queryR2Analytics(token, accountId, sinceIso) : Promise.resolve({ songs: [], videos: [], downloads: [] }),
    queryKvEvents(env, sinceDate)
  ]);
  const result = aggregateAdaptiveMetrics(zoneStats, r2Data, kvEvents, range, siteFilter, excludedIps);
  const referrerRows = accountId ? await queryReferrers(token, accountId, sinceIso, untilIso) : { rows: [], error: "No Cloudflare account ID available" };
  result.trafficSources = aggregateTrafficSources(referrerRows, siteFilter);
  return result;
}
__name(fetchLiveCloudflareData, "fetchLiveCloudflareData");
async function queryKvEvents(env, sinceDate) {
  if (!env.MEDIA_STATS || typeof env.MEDIA_STATS.list !== "function") return [];
  const sinceDay = sinceDate.toISOString().slice(0, 10);
  const keys = [];
  let cursor = void 0;
  let pages = 0;
  try {
    do {
      const res = await env.MEDIA_STATS.list({ prefix: "event:", cursor, limit: 1e3 });
      if (res.keys && res.keys.length) keys.push(...res.keys);
      cursor = res.list_complete ? void 0 : res.cursor;
      pages++;
    } while (cursor && pages < 5);
  } catch (e) {
    console.warn("Failed to list MEDIA_STATS KV:", e);
    return [];
  }
  const events = [];
  const missingMetadata = [];
  for (const k of keys) {
    const parts = k.name.split(":");
    if (parts.length < 5) continue;
    const date = parts[1];
    const host = parts[2].toLowerCase();
    const type = parts[3];
    const title = safeDecode(parts.slice(4).join(":"));
    if (date < sinceDay) continue;
    const site = SITES.find((s) => s.matchHosts.includes(host));
    if (!site) continue;
    if ((type === "video_play" || type === "song_play") && (site.trackMedia === false || isLottieAsset(title))) {
      continue;
    }
    if (type === "download" && site.trackDownloads === false) {
      continue;
    }
    if (type === "game_play" && site.trackMedia === false && !site.trackGames) {
      continue;
    }
    const metaCount = k.metadata && typeof k.metadata.count === "number" ? k.metadata.count : null;
    if (metaCount !== null) {
      if (metaCount > 0) events.push({ site, date, type, title, count: metaCount });
    } else {
      missingMetadata.push({ name: k.name, site, date, type, title });
    }
  }
  if (missingMetadata.length > 0 && typeof env.MEDIA_STATS.get === "function") {
    const batch = missingMetadata.slice(0, 20);
    const vals = await Promise.all(batch.map(async (item) => {
      try {
        const raw = await env.MEDIA_STATS.get(item.name);
        return parseInt(raw || "0", 10) || 0;
      } catch (e) {
        return 0;
      }
    }));
    batch.forEach((item, idx) => {
      if (vals[idx] > 0) {
        events.push({ site: item.site, date: item.date, type: item.type, title: item.title, count: vals[idx] });
      }
    });
  }
  return events;
}
__name(queryKvEvents, "queryKvEvents");
async function queryReferrers(token, accountId, sinceIso, untilIso) {
  const query = `
    query GetReferrers($accountTag: String!, $sinceIso: Time!, $untilIso: Time!) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          referrers: rumPageloadEventsAdaptiveGroups(
            filter: { datetime_geq: $sinceIso, datetime_leq: $untilIso }
            limit: 2000
            orderBy: [count_DESC]
          ) {
            count
            sum { visits }
            dimensions {
              refererHost
              requestHost
            }
          }
        }
      }
    }
  `;
  try {
    const resp = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query, variables: { accountTag: accountId, sinceIso, untilIso } })
    });
    if (!resp.ok) return { rows: [], error: `HTTP ${resp.status}` };
    const json = await resp.json();
    if (json.errors && json.errors.length > 0) {
      console.warn("Referrer query warnings:", json.errors);
    }
    const groups = json.data?.viewer?.accounts?.[0]?.referrers || [];
    const rows = groups.map((g) => ({
      count: g.count,
      // Count page loads (internal navigation is filtered out later), which is far more complete than RUM `visits`
      sum: { visits: g.count || 0 },
      dimensions: { clientRefererHost: g.dimensions?.refererHost || "", clientRequestHTTPHost: g.dimensions?.requestHost || "" }
    }));
    return { rows, error: json.errors?.[0]?.message || null };
  } catch (e) {
    console.warn("Failed to query referrers:", e);
    return { rows: [], error: e.message };
  }
}
__name(queryReferrers, "queryReferrers");
var SEARCH_HOSTS = ["google.", "bing.com", "duckduckgo.com", "yahoo.", "ecosia.org", "search.brave.com", "yandex.", "baidu.com", "startpage.com", "qwant.com", "kagi.com"];
var SOCIAL_HOSTS = ["facebook.com", "fb.com", "fb.me", "instagram.com", "t.co", "twitter.com", "x.com", "pinterest.", "pin.it", "reddit.com", "youtube.com", "youtu.be", "linkedin.com", "lnkd.in", "tiktok.com", "threads.net", "bsky.app", "mastodon.", "tumblr.com", "whatsapp.com", "telegram.", "discord.com"];
var AI_HOSTS = ["chatgpt.com", "chat.openai.com", "perplexity.ai", "claude.ai", "gemini.google.com", "copilot.microsoft.com"];
var EMAIL_HOSTS = ["mail.google.com", "outlook.", "mail.yahoo.com", "substack.com", "ghost.io"];
function hostMatches(host, patterns) {
  return patterns.some((p) => p.endsWith(".") ? host.includes(p) : host === p || host.endsWith("." + p));
}
__name(hostMatches, "hostMatches");
function classifyReferrer(host) {
  if (!host) return "Direct / None";
  if (hostMatches(host, AI_HOSTS)) return "AI Assistants";
  if (hostMatches(host, EMAIL_HOSTS)) return "Email / Newsletter";
  if (hostMatches(host, SEARCH_HOSTS)) return "Search";
  if (hostMatches(host, SOCIAL_HOSTS)) return "Social";
  return "Referral";
}
__name(classifyReferrer, "classifyReferrer");
function aggregateTrafficSources({ rows = [], error = null } = {}, siteFilter) {
  const categories = {};
  const referrers = {};
  rows.forEach((row) => {
    if (row.dimensions?.verifiedBotCategory) return;
    const reqHost = (row.dimensions?.clientRequestHTTPHost || "").split(":")[0].toLowerCase();
    const site = SITES.find((s) => s.matchHosts.includes(reqHost));
    if (!site || reqHost.startsWith("media.") || reqHost === "daily.shalonely.com") return;
    if (siteFilter !== "all" && site.id !== siteFilter) return;
    const refHost = (row.dimensions?.clientRefererHost || "").split(":")[0].toLowerCase().replace(/^www\./, "");
    if (refHost && site.matchHosts.some((h) => h.replace(/^www\./, "") === refHost)) return;
    const visits = row.sum?.visits || 0;
    if (visits === 0) return;
    const category = classifyReferrer(refHost);
    categories[category] = (categories[category] || 0) + visits;
    const key = refHost || "(direct)";
    if (!referrers[key]) {
      referrers[key] = { host: key, category, visits: 0, sites: /* @__PURE__ */ new Set() };
    }
    referrers[key].visits += visits;
    referrers[key].sites.add(site.domain);
  });
  const categoryList = Object.entries(categories).map(([name, visits]) => ({ name, visits })).sort((a, b) => b.visits - a.visits);
  const topReferrers = Object.values(referrers).map((r) => ({ host: r.host, category: r.category, visits: r.visits, sites: Array.from(r.sites) })).sort((a, b) => b.visits - a.visits).slice(0, 25);
  return {
    total: categoryList.reduce((a, b) => a + b.visits, 0),
    categories: categoryList,
    topReferrers,
    error
  };
}
__name(aggregateTrafficSources, "aggregateTrafficSources");
async function getZonesMap(token) {
  const resp = await fetch("https://api.cloudflare.com/client/v4/zones?per_page=50", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Failed to list Cloudflare zones (${resp.status}): ${errText}`);
  }
  const data = await resp.json();
  const map = {};
  if (data.result && Array.isArray(data.result)) {
    data.result.forEach((z) => {
      map[z.name.toLowerCase()] = z.id;
    });
  }
  return map;
}
__name(getZonesMap, "getZonesMap");
async function getAccountId(token) {
  try {
    const resp = await fetch("https://api.cloudflare.com/client/v4/accounts?per_page=5", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.result && data.result.length > 0) {
        return data.result[0].id;
      }
    }
  } catch (e) {
    console.warn("Could not auto-fetch account ID:", e);
  }
  return null;
}
__name(getAccountId, "getAccountId");
async function queryZoneAdaptiveAnalytics(token, zoneTags, sinceIso, untilIso, excludedIps = [], matchHosts = []) {
  const hasExcluded = excludedIps.length > 0;
  const hasHosts = matchHosts.length > 0;
  const extraArgs = [
    hasExcluded ? "$excludedIps: [String!]" : "",
    hasHosts ? "$matchHosts: [String!]" : ""
  ].filter(Boolean).join(", ");
  const commonFilterParts = [
    "datetime_geq: $sinceIso",
    "datetime_leq: $untilIso",
    hasExcluded ? "clientIP_notin: $excludedIps" : "",
    hasHosts ? "clientRequestHTTPHost_in: $matchHosts" : ""
  ].filter(Boolean).join(", ");
  const query = `
    query GetZoneAdaptiveData($zoneTags: [String!], $sinceIso: String!, $untilIso: String!${extraArgs ? ", " + extraArgs : ""}) {
      viewer {
        zones(filter: { zoneTag_in: $zoneTags }) {
          zoneTag
          overview: httpRequestsAdaptiveGroups(
            filter: { ${commonFilterParts} }
            limit: 5000
            orderBy: [datetimeHour_ASC]
          ) {
            count
            sum {
              edgeResponseBytes
              visits
            }
            dimensions {
              datetimeHour
              clientRequestHTTPHost
              verifiedBotCategory
            }
          }
          topAudio: httpRequestsAdaptiveGroups(
            filter: {
              ${commonFilterParts}
              clientRequestPath_like: "%.mp3%"
              edgeResponseStatus_in: [200, 206, 304]
            }
            limit: 250
            orderBy: [count_DESC]
          ) {
            count
            sum {
              edgeResponseBytes
            }
            dimensions {
              clientRequestPath
              clientRequestHTTPHost
              edgeResponseStatus
            }
          }
          topVideo: httpRequestsAdaptiveGroups(
            filter: {
              ${commonFilterParts}
              clientRequestPath_like: "%.mp4%"
              edgeResponseStatus_in: [200, 206, 304]
            }
            limit: 250
            orderBy: [count_DESC]
          ) {
            count
            sum {
              edgeResponseBytes
            }
            dimensions {
              clientRequestPath
              clientRequestHTTPHost
              edgeResponseStatus
            }
          }
          topDownloads: httpRequestsAdaptiveGroups(
            filter: {
              ${commonFilterParts}
              clientRequestPath_like: "%.pdf%"
              edgeResponseStatus_in: [200, 206]
            }
            limit: 250
            orderBy: [count_DESC]
          ) {
            count
            sum {
              edgeResponseBytes
            }
            dimensions {
              clientRequestPath
              clientRequestHTTPHost
            }
          }
          topZips: httpRequestsAdaptiveGroups(
            filter: {
              ${commonFilterParts}
              clientRequestPath_like: "%.zip%"
              edgeResponseStatus_in: [200, 206]
            }
            limit: 250
            orderBy: [count_DESC]
          ) {
            count
            sum {
              edgeResponseBytes
            }
            dimensions {
              clientRequestPath
              clientRequestHTTPHost
            }
          }
        }
      }
    }
  `;
  const chunks = [];
  for (let i = 0; i < zoneTags.length; i += 5) {
    chunks.push(zoneTags.slice(i, i + 5));
  }
  const results = await Promise.all(chunks.map(async (batch) => {
    const variables = { zoneTags: batch, sinceIso, untilIso };
    if (hasExcluded) variables.excludedIps = excludedIps;
    if (hasHosts) variables.matchHosts = matchHosts;
    const resp = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ query, variables })
    });
    if (!resp.ok) {
      throw new Error(`Cloudflare GraphQL query failed with status ${resp.status}`);
    }
    const json = await resp.json();
    if (json.errors && json.errors.length > 0) {
      console.warn("Cloudflare GraphQL partial warnings:", json.errors);
    }
    return json.data && json.data.viewer && json.data.viewer.zones || [];
  }));
  return results.flat();
}
__name(queryZoneAdaptiveAnalytics, "queryZoneAdaptiveAnalytics");
async function queryR2Analytics(token, accountId, sinceIso) {
  const query = `
    query GetR2Metrics($accountTag: String!, $sinceIso: String!) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          r2OperationsAdaptiveGroups(
            filter: { datetime_geq: $sinceIso, actionType: "GetObject" }
            limit: 500
            orderBy: [sum_requests_DESC]
          ) {
            dimensions {
              bucketName
              objectName
            }
            sum {
              requests
              responsePayloadSize
            }
          }
        }
      }
    }
  `;
  try {
    const resp = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        query,
        variables: { accountTag: accountId, sinceIso }
      })
    });
    if (!resp.ok) return { songs: [], videos: [], downloads: [] };
    const json = await resp.json();
    const ops = json.data?.viewer?.accounts?.[0]?.r2OperationsAdaptiveGroups || [];
    const songs = [];
    const videos = [];
    const downloads = [];
    const audioExts = [".mp3", ".m4a", ".wav", ".ogg", ".flac", ".aac"];
    const videoExts = [".mp4", ".webm", ".mov", ".m4v", ".mkv"];
    const dlExts = [".pdf", ".zip", ".epub", ".mobi", ".tar.gz", ".dmg", ".apk"];
    ops.forEach((item) => {
      const name = (item.dimensions?.objectName || "").toLowerCase();
      const rawName = item.dimensions?.objectName || "Unknown File";
      const requests = item.sum?.requests || 0;
      const bytes = item.sum?.responsePayloadSize || 0;
      const bucket = item.dimensions?.bucketName || "R2 Bucket";
      const title = decodeURIComponent(rawName.split("/").pop().split("?")[0]);
      if (audioExts.some((ext) => name.endsWith(ext))) {
        songs.push({ title, rawName, site: bucket, plays: requests, bytes, source: "Cloudflare R2" });
      } else if (videoExts.some((ext) => name.endsWith(ext))) {
        videos.push({ title, rawName, site: bucket, plays: requests, bytes, source: "Cloudflare R2" });
      } else if (dlExts.some((ext) => name.endsWith(ext))) {
        const ext = title.split(".").pop();
        downloads.push({ title, rawName, site: bucket, ext, downloads: requests, bytes, source: "Cloudflare R2" });
      }
    });
    return { songs, videos, downloads };
  } catch (e) {
    console.warn("Failed to query R2 analytics:", e);
    return { songs: [], videos: [], downloads: [] };
  }
}
__name(queryR2Analytics, "queryR2Analytics");
function addPlayEntry(map, siteDomain, siteFilter, siteId, title, rawName, plays, bytes, source) {
  if (siteFilter !== "all" && siteFilter !== siteId) return;
  const key = `${siteDomain}::${title}`;
  if (!map[key]) {
    map[key] = { title, rawName, site: siteDomain, plays, bytes, source };
  } else {
    map[key].plays += plays;
    map[key].bytes += bytes;
  }
}
__name(addPlayEntry, "addPlayEntry");
function addDownloadEntry(map, siteDomain, siteFilter, siteId, title, rawName, ext, downloads, bytes, source) {
  if (siteFilter !== "all" && siteFilter !== siteId) return;
  const key = `${siteDomain}::${title}`;
  if (!map[key]) {
    map[key] = { title, rawName, site: siteDomain, ext, downloads, bytes, source };
  } else {
    map[key].downloads += downloads;
    map[key].bytes += bytes;
  }
}
__name(addDownloadEntry, "addDownloadEntry");
function aggregateAdaptiveMetrics(zonesData, r2Data, kvEvents = [], range, siteFilter, excludedIps = []) {
  const siteTotals = {};
  SITES.forEach((s) => {
    siteTotals[s.id] = {
      ...s,
      requests: 0,
      pageViews: 0,
      threats: 0,
      uniques: 0,
      bytes: 0,
      songPlays: 0,
      videoPlays: 0,
      gamePlays: 0,
      downloads: 0
    };
  });
  const timelineMap = {};
  const songsMap = {};
  const videosMap = {};
  const gamesMap = {};
  const downloadsMap = {};
  zonesData.forEach((z) => {
    const overview = z.overview || [];
    overview.forEach((row) => {
      const rawHost = (row.dimensions?.clientRequestHTTPHost || "").toLowerCase();
      const host = rawHost.split(":")[0];
      const dt = row.dimensions?.datetimeHour || "";
      const timeLabel = range === "24h" ? dt.slice(11, 16) : dt.slice(5, 10);
      const isBot = !!(row.dimensions?.verifiedBotCategory && row.dimensions.verifiedBotCategory.trim() !== "");
      const clientIp = row.dimensions?.clientIP || "";
      if (clientIp && excludedIps.includes(clientIp)) {
        return;
      }
      SITES.forEach((site) => {
        if (!site.matchHosts.includes(host)) return;
        const st = siteTotals[site.id];
        const count = row.count || 0;
        const bytes = row.sum?.edgeResponseBytes || 0;
        const visits = row.sum?.visits || 0;
        const isMediaSubhost = host === "daily.shalonely.com" || host.startsWith("media.");
        st.requests += count;
        st.bytes += bytes;
        if (!isMediaSubhost) {
          st.pageViews += visits > 0 ? visits : Math.round(count * 0.4);
          st.uniques += visits;
        }
        if (isBot) {
          st.threats += count;
        }
        if (siteFilter === "all" || siteFilter === site.id) {
          if (!timelineMap[timeLabel]) {
            timelineMap[timeLabel] = { time: timeLabel, sortKey: dt, requests: 0, threats: 0, human: 0 };
          } else if (dt < timelineMap[timeLabel].sortKey) {
            timelineMap[timeLabel].sortKey = dt;
          }
          timelineMap[timeLabel].requests += count;
          if (isBot) {
            timelineMap[timeLabel].threats += count;
          } else {
            timelineMap[timeLabel].human += count;
          }
        }
      });
    });
    (z.topAudio || []).forEach((item) => {
      const path = item.dimensions?.clientRequestPath || "";
      const rawHost = (item.dimensions?.clientRequestHTTPHost || "").split(":")[0].toLowerCase();
      const clientIp = item.dimensions?.clientIP || "";
      const status = item.dimensions?.edgeResponseStatus || 206;
      if (clientIp && excludedIps.includes(clientIp)) return;
      const site = SITES.find((s) => s.matchHosts.includes(rawHost));
      if (!site || site.trackMedia === false) return;
      const filename = safeDecode(path.split("/").pop().split("?")[0]);
      if (filename && filename.toLowerCase().endsWith(".mp3")) {
        const plays = item.count || 0;
        const bytes = item.sum?.edgeResponseBytes || 0;
        siteTotals[site.id].songPlays += plays;
        addPlayEntry(songsMap, site.domain, siteFilter, site.id, filename, path, plays, bytes, "Cloudflare Edge");
        if (status === 200 && site.trackDownloads !== false) {
          siteTotals[site.id].downloads += plays;
          addDownloadEntry(downloadsMap, site.domain, siteFilter, site.id, filename, path, "mp3", plays, bytes, "Direct Download");
        }
      }
    });
    (z.topVideo || []).forEach((item) => {
      const path = item.dimensions?.clientRequestPath || "";
      const rawHost = (item.dimensions?.clientRequestHTTPHost || "").split(":")[0].toLowerCase();
      const clientIp = item.dimensions?.clientIP || "";
      if (clientIp && excludedIps.includes(clientIp)) return;
      const site = SITES.find((s) => s.matchHosts.includes(rawHost));
      if (!site || site.trackMedia === false) return;
      const filename = safeDecode(path.split("/").pop().split("?")[0]);
      if (filename && filename.toLowerCase().endsWith(".mp4")) {
        const plays = item.count || 0;
        const bytes = item.sum?.edgeResponseBytes || 0;
        siteTotals[site.id].videoPlays += plays;
        addPlayEntry(videosMap, site.domain, siteFilter, site.id, filename, path, plays, bytes, "Cloudflare Edge");
      }
    });
    [
      { rows: z.topDownloads || [], ext: "pdf" },
      { rows: z.topZips || [], ext: "zip" }
    ].forEach(({ rows, ext }) => {
      rows.forEach((item) => {
        const path = item.dimensions?.clientRequestPath || "";
        const rawHost = (item.dimensions?.clientRequestHTTPHost || "").split(":")[0].toLowerCase();
        const clientIp = item.dimensions?.clientIP || "";
        if (clientIp && excludedIps.includes(clientIp)) return;
        const site = SITES.find((s) => s.matchHosts.includes(rawHost));
        if (!site || site.trackDownloads === false) return;
        const filename = safeDecode(path.split("/").pop().split("?")[0]);
        if (filename && filename.toLowerCase().endsWith("." + ext)) {
          const count = item.count || 0;
          const bytes = item.sum?.edgeResponseBytes || 0;
          siteTotals[site.id].downloads += count;
          addDownloadEntry(downloadsMap, site.domain, siteFilter, site.id, filename, path, ext, count, bytes, "Cloudflare Edge");
        }
      });
    });
  });
  r2Data.songs.forEach((s) => {
    const r2Site = SITES.find((site) => (site.r2Buckets || []).includes(s.site));
    if (r2Site && r2Site.trackMedia === false) return;
    const siteDomain = r2Site ? r2Site.domain : s.site;
    const key = `${siteDomain}::${s.title}`;
    if (!songsMap[key]) {
      if (r2Site) siteTotals[r2Site.id].songPlays += s.plays;
      if (!r2Site || siteFilter === "all" || siteFilter === r2Site.id) {
        songsMap[key] = { ...s, site: siteDomain };
      }
    }
  });
  r2Data.videos.forEach((v) => {
    const r2Site = SITES.find((site) => (site.r2Buckets || []).includes(v.site));
    if (r2Site && r2Site.trackMedia === false) return;
    const siteDomain = r2Site ? r2Site.domain : v.site;
    const key = `${siteDomain}::${v.title}`;
    if (!videosMap[key]) {
      if (r2Site) siteTotals[r2Site.id].videoPlays += v.plays;
      if (!r2Site || siteFilter === "all" || siteFilter === r2Site.id) {
        videosMap[key] = { ...v, site: siteDomain };
      }
    }
  });
  r2Data.downloads.forEach((d) => {
    const r2Site = SITES.find((site) => (site.r2Buckets || []).includes(d.site));
    if (r2Site && r2Site.trackDownloads === false) return;
    const siteDomain = r2Site ? r2Site.domain : d.site;
    const key = `${siteDomain}::${d.title}`;
    if (!downloadsMap[key]) {
      if (r2Site) siteTotals[r2Site.id].downloads += d.downloads;
      if (!r2Site || siteFilter === "all" || siteFilter === r2Site.id) {
        downloadsMap[key] = { ...d, site: siteDomain };
      }
    }
  });
  const edgeSongKeys = new Set(Object.keys(songsMap));
  const edgeVideoKeys = new Set(Object.keys(videosMap));
  const edgeDownloadKeys = new Set(Object.keys(downloadsMap));
  const kvPageViewsBySite = {};
  kvEvents.forEach((ev) => {
    const { site, date, type, title, count } = ev;
    const st = siteTotals[site.id];
    if (!st) return;
    if (type === "video_play") {
      const key = `${site.domain}::${title}`;
      if (edgeVideoKeys.has(key)) return;
      st.videoPlays += count;
      addPlayEntry(videosMap, site.domain, siteFilter, site.id, title, title, count, 0, "Ghost / Beacon");
    } else if (type === "song_play") {
      const key = `${site.domain}::${title}`;
      if (edgeSongKeys.has(key)) return;
      st.songPlays += count;
      addPlayEntry(songsMap, site.domain, siteFilter, site.id, title, title, count, 0, "Ghost / Beacon");
    } else if (type === "game_play") {
      st.gamePlays += count;
      addPlayEntry(gamesMap, site.domain, siteFilter, site.id, title, title, count, 0, "Ghost / Beacon");
    } else if (type === "download") {
      const displayTitle = cleanTrackTitle("download", title, "");
      const key = `${site.domain}::${displayTitle}`;
      if (edgeDownloadKeys.has(key)) return;
      const extMatch = displayTitle.match(/\.([a-z0-9]{2,5})$/i);
      const ext = extMatch ? extMatch[1].toLowerCase() : "file";
      st.downloads += count;
      addDownloadEntry(downloadsMap, site.domain, siteFilter, site.id, displayTitle, title, ext, count, 0, "Ghost / Beacon");
    } else if (type === "page_view" && site.platform === "Ghost" && site.type === "subdomain") {
      kvPageViewsBySite[site.id] = (kvPageViewsBySite[site.id] || 0) + count;
      if (range !== "24h" && (siteFilter === "all" || siteFilter === site.id)) {
        const timeLabel = date.slice(5, 10);
        const sortKey = date + "T00:00:00Z";
        if (!timelineMap[timeLabel]) {
          timelineMap[timeLabel] = { time: timeLabel, sortKey, requests: 0, threats: 0, human: 0 };
        }
        timelineMap[timeLabel].requests += count;
        timelineMap[timeLabel].human += count;
      }
    }
  });
  Object.entries(kvPageViewsBySite).forEach(([siteId, pv]) => {
    const st = siteTotals[siteId];
    if (st && pv > st.pageViews) {
      st.pageViews = pv;
    }
  });
  Object.values(siteTotals).forEach((st) => {
    st.botPercent = st.requests > 0 ? st.threats / st.requests * 100 : 0;
    st.estimatedVisitors = st.uniques > 0 ? st.uniques : Math.round(st.pageViews * 0.7);
  });
  let activeSites = Object.values(siteTotals);
  if (siteFilter !== "all") {
    activeSites = activeSites.filter((s) => s.id === siteFilter);
  }
  const totals = {
    requests: activeSites.reduce((a, b) => a + b.requests, 0),
    pageViews: activeSites.reduce((a, b) => a + b.pageViews, 0),
    threats: activeSites.reduce((a, b) => a + b.threats, 0),
    bytes: activeSites.reduce((a, b) => a + b.bytes, 0),
    uniques: activeSites.reduce((a, b) => a + (b.uniques || b.estimatedVisitors), 0),
    songPlays: activeSites.reduce((a, b) => a + b.songPlays, 0),
    videoPlays: activeSites.reduce((a, b) => a + b.videoPlays, 0),
    gamePlays: activeSites.reduce((a, b) => a + b.gamePlays, 0),
    downloads: activeSites.reduce((a, b) => a + b.downloads, 0)
  };
  totals.botPercent = totals.requests > 0 ? totals.threats / totals.requests * 100 : 0;
  totals.humanRequests = Math.max(0, totals.requests - totals.threats);
  totals.crawlerRequests = totals.threats;
  totals.threatRequests = Math.round(totals.threats * 0.4);
  const timeline = Object.values(timelineMap).sort((a, b) => (a.sortKey || "").localeCompare(b.sortKey || "")).map(({ sortKey, ...rest }) => rest);
  const allSongs = Object.values(songsMap).sort((a, b) => b.plays - a.plays);
  const allVideos = Object.values(videosMap).sort((a, b) => b.plays - a.plays);
  const allGames = Object.values(gamesMap).sort((a, b) => b.plays - a.plays);
  const allDownloads = Object.values(downloadsMap).sort((a, b) => b.downloads - a.downloads);
  return {
    totals,
    timeline,
    sites: Object.values(siteTotals),
    topSongs: allSongs.slice(0, 8),
    allSongs,
    topVideos: allVideos.slice(0, 8),
    allVideos,
    topGames: allGames.slice(0, 8),
    allGames,
    topDownloads: allDownloads.slice(0, 8),
    allDownloads,
    excludedIps
  };
}
__name(aggregateAdaptiveMetrics, "aggregateAdaptiveMetrics");
function generateMockData(range, siteFilter) {
  return {
    warning: "Running with simulated data. Set CLOUDFLARE_API_TOKEN to fetch live data.",
    totals: { requests: 0, pageViews: 0, threats: 0, uniques: 0, songPlays: 0, videoPlays: 0, gamePlays: 0, downloads: 0, botPercent: 0 },
    timeline: [],
    sites: SITES.map((s) => ({ ...s, requests: 0, pageViews: 0, threats: 0, uniques: 0, botPercent: 0, songPlays: 0, videoPlays: 0, gamePlays: 0, downloads: 0 })),
    topSongs: [],
    allSongs: [],
    topVideos: [],
    allVideos: [],
    topGames: [],
    allGames: [],
    topDownloads: [],
    allDownloads: [],
    trafficSources: { total: 0, categories: [], topReferrers: [] }
  };
}
__name(generateMockData, "generateMockData");
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
