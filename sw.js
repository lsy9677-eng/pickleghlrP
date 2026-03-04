// [수정] 매번 바뀌는 시간 대신 고정된 버전을 사용하세요.
// 업데이트가 필요할 때만 이 숫자를 변경하면 됩니다 (예: v1 -> v2)
const CACHE_NAME = 'jinrye-pickleball-v20260122_01'; 

// 설치: 대기 없이 즉시 설치 (코드가 변경되었을 때만 수행됨)
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
});

// 활성화: 즉시 클라이언트 제어권 가져오기 및 구버전 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      clients.claim(), // 즉시 페이지 제어
      caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
          // 현재 버전과 다른 캐시는 삭제
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        }));
      })
    ])
  );
});

// Fetch: 네트워크 우선, 실패 시 캐시 (또는 캐시 우선 등 전략에 따라)
// 여기서는 가장 기본적인 '캐시된 것 있으면 쓰고, 없으면 네트워크' 전략 사용
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});