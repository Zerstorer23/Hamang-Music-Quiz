# 프로젝트 설치 방법

0. 리액트, TypeScript, 파이어베이스로 구성되어있습니다.

1. NodeJs 설치, 파이어베이스 실시간 데이터베이스 설정

2. 레포지토리 복사 후 npm run build 명령어로 dependency 설치

3. public/ 폴더에 CNAME 파일 제거
(도메인연결파일임)

4. fbkey/ 폴더의 fakeKey.tsx 파일 참조, 파이어베이스 설정후
   Database/keys/SGconfig.tsx 이름으로 붙여넣기
   (폴더없으면 생성)

5. npm run start로 시작

## 음악 플레이리스트

플레이리스트는 따로 서버에 저장되어있지않고
직접 CSV파일로 제작하여 파일탐색기로 올려서 사용가능 (전원 공유)

아래의 링크는 기본등록된 플레이리스트 예제와 설정법

### 설정법 및 기본 리스트

https://docs.google.com/spreadsheets/d/1QluDRTVw7qz5rE46MpLYEFj_WntZUNa3THLvBeuvVJY/edit?usp=sharing

### 765 리스트

https://docs.google.com/spreadsheets/d/1E89UuJwiR3yRKNjifMK4nArg0iO7Ish09BHkMexXqo8/edit?usp=sharing

## 게임 설명

시범페이지 :
https://music.haruhi.boats

1. 아무거나 1~999 사이 방번호 입력해서 들어가서
2. 플레이리스트 선택후 한다.
3. 같은 방번호에 접속시 멀티플레이
4. 곡 선택, 업로드는 방장 권한
5. 답은 영어음표기 위주, 경우에따라 한글음표기, 번역표기 등등도 지원함

중계기는 로컬 호스트 9917번 포트로 메세지를 보내는데
중계기라는 다른 프로그램을 같이 실행하면 채팅메세지를 받아서 DC API이용 갤러리 글작성으로 보냄.
해당프로그램이 같이 실행되고있지않으면 아무일도 일어나지 않으니 신경안써도됨.
