# Virtual Debate Seoul

AI 서울시장 후보 가상 토론 시뮬레이터. 사용자가 서울시장 후보로 참여하여 AI 상대 후보와 실시간 토론을 진행합니다.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **AI**: Anthropic Claude API (Sonnet / Haiku)
- **Styling**: Tailwind CSS 4
- **TTS**: ElevenLabs API (optional)
- **Language**: TypeScript, React 19

## Features

- 사회자(김진행) 진행의 구조화된 토론
- 서울시 실제 데이터 기반 팩트체크
- 다양한 AI 상대 후보 페르소나 (공격형/방어형/중도형)
- 주택, 교통, 환경, 경제 등 서울시 핵심 정책 주제
- TTS 음성 출력 지원 (ElevenLabs 키 필요)

## Getting Started

### Prerequisites

- Node.js 18+
- Anthropic API Key

### Installation

```bash
npm install
```

### Environment Variables

`.env.local.example`을 복사하여 `.env.local`을 생성하고 API 키를 설정합니다:

```bash
cp .env.local.example .env.local
```

```
ANTHROPIC_API_KEY=sk-ant-xxxxx          # Required
ELEVENLABS_API_KEY=xxxxx                # Optional (for TTS)
ELEVENLABS_MODERATOR_VOICE_ID=xxxxx    # Optional
ELEVENLABS_OPPONENT_VOICE_ID=xxxxx     # Optional
```

### Run

```bash
npm run dev
```

http://localhost:3000 에서 접속합니다.

## Project Structure

```
app/
  api/
    debate/     - AI opponent response generation
    moderate/   - Moderator (김진행) script generation
    factcheck/  - Real-time fact checking
    tts/        - Text-to-speech
components/     - React UI components
hooks/          - Custom hooks (useDebate, useAudioPlayer)
lib/            - Claude client, prompts, debate engine
data/           - Seoul city data, debate topics
types/          - TypeScript type definitions
```

## License

MIT
