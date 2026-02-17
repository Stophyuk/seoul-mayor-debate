interface BridgeContext {
  candidateName: string;
  topic: string;
  round: number;
}

const BRIDGE_TEMPLATES: ((ctx: BridgeContext) => string)[] = [
  (ctx) =>
    `네, ${ctx.candidateName} 후보의 발언 잘 들었습니다. 홍봇 후보의 반론을 들어보겠습니다.`,
  (ctx) =>
    `${ctx.candidateName} 후보, 좋은 지적이었습니다. 홍봇 후보는 어떻게 생각하시는지요.`,
  (ctx) =>
    `알겠습니다. ${ctx.topic}에 대한 홍봇 후보의 의견도 들어보겠습니다.`,
  (ctx) =>
    `${ctx.candidateName} 후보의 말씀 잘 정리됐습니다. 홍봇 후보, 답변해 주시죠.`,
  (ctx) =>
    `흥미로운 관점이네요. 홍봇 후보의 반박을 기대해 보겠습니다.`,
  (ctx) =>
    `${ctx.candidateName} 후보 감사합니다. 같은 주제로 홍봇 후보에게 넘기겠습니다.`,
  (ctx) =>
    `네, ${ctx.topic} 관련 중요한 발언이었습니다. 홍봇 후보의 입장을 확인해 보죠.`,
  (ctx) =>
    `잘 들었습니다. 이번엔 홍봇 후보가 응답할 차례입니다.`,
  (ctx) =>
    `${ctx.candidateName} 후보의 제안을 확인했습니다. 홍봇 후보, 의견 부탁드립니다.`,
  (ctx) =>
    `좋습니다. ${ctx.round}라운드 ${ctx.topic} 논의가 활발하네요. 홍봇 후보 답변 부탁합니다.`,
  (ctx) =>
    `${ctx.candidateName} 후보 수고하셨습니다. 홍봇 후보의 시각도 들어보겠습니다.`,
  (ctx) =>
    `핵심을 잘 짚어 주셨습니다. 홍봇 후보, 이에 대해 한 말씀 해주시죠.`,
];

let lastIndex = -1;

export function getRandomBridgePhrase(ctx: BridgeContext): string {
  let idx: number;
  do {
    idx = Math.floor(Math.random() * BRIDGE_TEMPLATES.length);
  } while (idx === lastIndex && BRIDGE_TEMPLATES.length > 1);
  lastIndex = idx;
  return BRIDGE_TEMPLATES[idx](ctx);
}
