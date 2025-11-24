// sheetsService.js
// Simple fetch wrapper for the Apps Script Web App API.

// USAGE:
// sheetsService.setBaseUrl('https://script.google.com/macros/s/....../exec')
// sheetsService.listResource('profiles')

const sheetsService = (function(){
  // Default to the deployed Apps Script Web App and demo API key for convenient testing.
  // Replace these or call setBaseUrl/setApiKey at runtime for production.
  // Updated to the currently deployed public Web App URL (user-provided) - LATEST DEPLOYMENT
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwfo7HwzW3HnR63k-CTfn-XzUoXEB3upjUSbuZvw08xOlfsoHwiCowVRLDN69_lubsGJg/exec';
  const LOCAL_PROXY = 'http://localhost:8080';
  const LOCAL_PROXY_ALT = 'http://localhost:8081';
  let baseUrl = APPS_SCRIPT_URL;
  // Do NOT automatically switch baseUrl to a local proxy (it may not be running).
  // If you want to use a proxy for dev, call sheetsService.setBaseUrl('http://localhost:8081') manually.
  let apiKey = 'projfot_demo_7f3b9c2a';

  function setBaseUrl(url){ baseUrl = url.replace(/\/+$/,''); }
  function setApiKey(key){ apiKey = key; }

  async function request(resource, action='list', params={}, method='GET', body=null){
    if(!baseUrl) throw new Error('sheetsService: baseUrl not set');

    const url = new URL(baseUrl);
    url.searchParams.set('resource', resource);
    url.searchParams.set('action', action);
    if(apiKey) url.searchParams.set('key', apiKey);
    for(const k in params) if(params[k] != null) url.searchParams.set(k, params[k]);

    // If running on localhost/file and cross-origin or POST method is problematic,
    // prefer JSONP fallback for small bodies (login, auth). Also treat file:// opens
    // (when opening HTML directly) as local dev.
    const isLocal = (typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.protocol === 'file:' ||
      window.location.hostname === ''
    ));

    // ALWAYS use JSONP when running locally (avoids CORS issues with redirects)
    if (isLocal){
      try{
        const b = typeof body === 'string' ? tryParseJson(body) : (body || {});
        // If baseUrl points to a local proxy, JSONP must target the remote Apps Script URL
        const jsonpTarget = (baseUrl && baseUrl.indexOf('localhost') !== -1) ? APPS_SCRIPT_URL : url.toString();
        const jurl = new URL(jsonpTarget);
        for(const k in b) if(b[k] != null) jurl.searchParams.set(k, b[k]);
        console.log('[sheetsService] Using JSONP for local dev:', jurl.toString().substring(0, 100) + '...');
        return await jsonpRequest(jurl.toString());
      }catch(e){
        console.warn('[sheetsService] JSONP failed, trying fetch:', e);
        // fall through to fetch attempt if JSONP fails
      }
    }

    const opts = { method, headers: { 'Accept': 'application/json' } };
    if(body){ opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }

    // Important: tell fetch to follow redirects (default is 'follow' but be explicit)
    opts.redirect = 'follow';

    const res = await fetch(url.toString(), opts);
    // If the request fails with a server error or method not allowed, try JSONP fallback
    if(!res.ok){
      // try to provide more context: if running locally, attempt JSONP retry
      if ((res.status === 405 || res.status >= 500) && method === 'POST'){
        try{
          const b = typeof body === 'string' ? tryParseJson(body) : (body || {});
          const jsonpTarget = (baseUrl && baseUrl.indexOf('localhost') !== -1) ? APPS_SCRIPT_URL : url.toString();
          const jurl = new URL(jsonpTarget);
          for(const k in b) if(b[k] != null) jurl.searchParams.set(k, b[k]);
          return await jsonpRequest(jurl.toString());
        }catch(e){ /* ignore and fall through to throw original error */ }
      }
      throw new Error('Network response was not ok: ' + res.status);
    }

    const text = await res.text();
    try{ return JSON.parse(text); } catch(e){ return text; }
  }

  function tryParseJson(s){ try { return JSON.parse(s || '{}'); } catch(e){ return {}; } }

  function jsonpRequest(url){
    return new Promise((resolve, reject) => {
      const callbackName = '__jsonp_cb_' + Math.random().toString(36).slice(2);
      window[callbackName] = function(data){
        resolve(data); delete window[callbackName]; script.remove();
      };
      const sep = url.indexOf('?') === -1 ? '?' : '&';
      const script = document.createElement('script');
      script.src = url + sep + 'callback=' + callbackName;
      script.onerror = function(e){ delete window[callbackName]; reject(new Error('JSONP request failed')); };
      document.head.appendChild(script);
    });
  }

  // Explicit JSONP action helper (useful to force JSONP when local dev blocks POST)
  function postJsonp(resource, action, body){
    const jurl = new URL(APPS_SCRIPT_URL);
    jurl.searchParams.set('resource', resource);
    jurl.searchParams.set('action', action);
    if(apiKey) jurl.searchParams.set('key', apiKey);
    const b = typeof body === 'string' ? tryParseJson(body) : (body || {});
    for(const k in b) if(b[k] != null) jurl.searchParams.set(k, b[k]);
    return jsonpRequest(jurl.toString());
  }

  return { setBaseUrl, setApiKey, request, postJsonp, list: (r,p)=>request(r,'list',p,'GET'), get: (r,id)=>request(r,'get',{id},'GET'), create: (r,data)=>request(r,'create',{},'POST',data), update: (r,id,data)=>request(r,'update',{id},'POST',data) };
})();

// Expose globally for quick use in pages
window.sheetsService = sheetsService;

// Backwards/alt adapter used by our page modules
window.SheetsService = {
  setBaseUrl: sheetsService.setBaseUrl,
  setApiKey: sheetsService.setApiKey,
  fetchList: (resource, params) => sheetsService.list(resource, params),
  fetchGet: (resource, id) => sheetsService.get(resource, id),
  fetchCreate: (resource, body) => sheetsService.create(resource, body),
  fetchUpdate: (resource, id, body) => sheetsService.update(resource, id, body),
  fetchAction: (resource, action, body) => sheetsService.request(resource, action, {}, 'POST', body),
  postJsonp: (resource, action, body) => sheetsService.postJsonp(resource, action, body),
  // delete will be modeled as update with action=delete using POST and id in params
  fetchDelete: async (resource, id) => {
    // The Apps Script controller supports delete action; do a POST with no body but id param
    return await sheetsService.request(resource, 'delete', { id: id }, 'POST', null);
  }
};