# 공개 서버 배포

현재 공개 주소: http://54.79.163.143/

Nginx가 `/var/www/mapsosa/current`의 빌드 결과만 제공합니다.
`current`는 배포 버전 디렉터리를 가리키는 심볼릭 링크입니다.
공개 IP는 EC2 메타데이터로 확인했으며 기존 DuckDNS 도메인은 이전 IP를 가리키므로 현재 배포에는 사용하지 않습니다.

- 환경 설정: `.env.production`의 `VITE_SITE_URL`
- Nginx 설정 원본: `deploy/mapsosa-ip.conf`
- 적용된 설정: `/etc/nginx/conf.d/mapsosa-ip.conf`
- 첫 배포: `/var/www/mapsosa/releases/20261007-0710`

## 수정 후 다시 배포

프로젝트 루트에서 다음 명령을 실행합니다. 시스템 배포 경로에 쓰기 위해 sudo 권한이 필요합니다.
개발 서버의 변경은 공개 사이트에 자동 반영되지 않습니다.

```bash
npm run lint
npm run build
```

두 명령이 성공한 뒤 빌드를 새 버전으로 복사하고 링크를 교체합니다.

```bash
mapsosa_release="/var/www/mapsosa/releases/$(date -u +%Y%m%d-%H%M%S)"
sudo mkdir -p "$mapsosa_release"
sudo cp -a dist/. "$mapsosa_release/"
sudo chown -R root:root "$mapsosa_release"
sudo chmod -R a+rX "$mapsosa_release"
sudo ln -s "$mapsosa_release" /var/www/mapsosa/current.next
sudo mv -Tf /var/www/mapsosa/current.next /var/www/mapsosa/current
```

빌드 결과 교체만으로는 Nginx 재시작이 필요하지 않습니다.
서버 IP나 도메인을 변경할 때는 환경 설정과 Nginx 설정을 함께 변경하고 빌드를 다시 만듭니다.

## 부산 MICE 캘린더

공식 출처는 [부산 MICE 플랫폼 행사정보](https://www.busanmice.or.kr/portal/evntInfo/list.do?mid=0203000000)입니다.
페이지의 공개 목록 조회 경로를 서버에서 읽습니다. 문서화된 OpenAPI가 아니므로 원본의 응답 구조가 변경되면 연동 코드를 수정해야 합니다.

- 로컬 실행: `npm run mice:server`와 `npm run dev`를 각각 실행합니다. Vite가 `/api/mice`를 로컬 서버로 전달합니다.
- 운영 실행: `deploy/mapsosa-mice.service`를 `/etc/systemd/system/mapsosa-mice.service`에 설치하고 `sudo systemctl daemon-reload`, `sudo systemctl enable --now mapsosa-mice.service`를 실행합니다.
- Nginx의 `/api/mice/`는 `127.0.0.1:4174`로 전달됩니다. 백엔드는 외부 인터페이스에서 직접 수신하지 않습니다.
- 백엔드 코드를 수정했다면 `sudo systemctl restart mapsosa-mice.service`로 반영합니다. 프런트엔드 변경은 위의 빌드 배포 절차를 따릅니다.
- 조회 범위는 이번 달 앞뒤 12개월입니다. 월별 결과를 6시간 캐시하고, 같은 월의 동시 요청은 하나로 합칩니다. 갱신 실패 시 최대 48시간 이내의 이전 결과를 표시하고 이전 자료임을 알립니다.
- API는 행사 ID·제목·기간·장소·유형·원본 링크만 제공합니다. 불완전한 페이지 수집은 성공으로 처리하지 않습니다.
- 원본 서버에서 빠진 중간 인증서는 발급기관 GlobalSign의 공개 인증서로 보완합니다. TLS 검증을 끄지 않습니다. 인증서 변경 시 `server/certs`의 중간 인증서를 확인합니다.
- 날짜별 건수는 그날 진행 중인 행사 수입니다. 장기간 행사는 각 날짜에 포함되며, 실제 관광객 수나 혼잡도를 나타내지 않습니다.
- 검증: `npm run test:mice`.
