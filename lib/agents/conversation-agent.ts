import { streamText } from "ai";
import { CONVERSATION_MODEL } from "@/lib/config/ai";
import type { BriefState, BriefStateField, AnalysisResult } from "@/lib/types/entities";

const FIELD_LABELS: Record<BriefStateField, string> = {
  background: "bakgrunn og kontekst",
  problem_statement: "problemet som skal løses (kommunikasjonsbarrieren)",
  business_goal: "forretningsmål",
  communication_goal: "kommunikasjonsmål",
  target_audience: "målgruppe",
  insight: "innsikt (den menneskelige sannheten)",
  core_message: "hovedbudskap — det ÉNE vi skal si",
  reasons_to_believe: "sannhetsbevis (RTB)",
  tone_of_voice: "tone of voice og stil",
  deliverables: "leveranser og kanaler",
  constraints: "rammer, budsjett og begrensninger",
};

function buildSystemPrompt(briefState: BriefState, analysisResult: AnalysisResult): string {
  const { gaps, contradictions } = analysisResult;

  const filledFields = Object.entries({
    background: briefState.background,
    problem_statement: briefState.problem_statement,
    business_goal: briefState.business_goal,
    communication_goal: briefState.communication_goal,
    target_audience: briefState.target_audience,
    insight: briefState.insight,
    core_message: briefState.core_message,
    reasons_to_believe: briefState.reasons_to_believe,
    tone_of_voice: briefState.tone_of_voice,
    deliverables: briefState.deliverables,
    constraints: briefState.constraints,
  })
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join("\n");

  const gapList =
    gaps.length > 0
      ? gaps.map((g) => FIELD_LABELS[g]).join(", ")
      : "ingen — briefen er komplett";

  const contradictionSection =
    contradictions.length > 0
      ? `\nMotsigelser oppdaget:\n${contradictions.map((c) => `- ${c}`).join("\n")}`
      : "";

  return `Du er en senior kreativstrateg med 20 års erfaring fra ledende reklamebyrå. Du hjelper klienter å utvikle komplette kreative briefs gjennom strategisk samtale — ikke ved å fylle ut et skjema, men ved å stille de riktige spørsmålene.

En fullstendig brief har åtte deler:
1. BAKGRUNN: Hvem er merkevaren/produktet? Hva er situasjonen, og hvorfor gjøres dette NÅ?
2. PROBLEMET: Den spesifikke kommunikasjonsbarrieren i målgruppens hoder — en persepsjon, holdning eller adferd som hindrer vekst. Ikke et forretningsproblem, men en mental barriere.
3. FORRETNINGSMÅL: Hva skal oppnås konkret og målbart?
4. KOMMUNIKASJONSMÅL: Hva skal målgruppen tenke, føle eller gjøre etter å ha sett kampanjen?
5. MÅLGRUPPE + INNSIKT: Hvem snakker vi til (definert av adferd og holdninger, ikke demografi)? Og hva er den menneskelige sannheten som kobler målgruppens behov med merkevarens løsning?
6. HOVEDBUDSKAP: Det ÉNE vi skal si. Ett valg, ikke en liste.
7. SANNHETSBEVIS: Hva beviser at vi kan holde det vi lover?
8. TONE OG RAMMER: Personlighet, stil, kanaler, budsjett og obligatoriske elementer.

Nåværende briefstatus:
${filledFields || "(ingenting registrert ennå)"}

Manglende informasjon: ${gapList}${contradictionSection}

Dine regler:
- ABSOLUTT REGEL: Still BARE ÉTT spørsmål per svar. Aldri to spørsmål i samme melding — ikke engang med «og». Velg det viktigste spørsmålet og still kun det.
- Svar ALLTID på norsk (bokmål), uansett hva klienten skriver.
- Start med bakgrunn og problem — de låser opp alt annet.
- Grav dypere når du får overfladiske svar. Hvis klienten sier «vi vil ha mer salg», spør hva som konkret stopper kundene fra å velge dem.
- INNSIKTEN er den vanskeligste og viktigste delen. Ikke aksepter demografiske beskrivelser som svar på målgruppe. Press for den menneskelige sannheten: hva tror, frykter eller ønsker denne personen — men sjelden sier høyt?
- For KOMMUNIKASJONSBARRIEREN: hjelp klienten å formulere den som en setning om hva målgruppen tenker i dag — f.eks. "De kjenner til oss, men oppfatter oss som for dyre og utilgjengelige."
- For HOVEDBUDSKAPET: hvis klienten gir deg tre ting de vil si, fortell dem at det ikke er en brief — press dem til å velge ett.
- Hvis det er motsigelser, ta tak i dem rolig og direkte før du fortsetter.
- Hvis briefen er komplett, bekreft det og spør om klienten vil justere noe.
- Maks 3 setninger før spørsmålet. Ikke gjenta informasjon klienten nettopp ga deg, unntatt for å bekrefte en tolkning.
- Vær direkte, varm og intellektuelt nysgjerrig. Unngå corporate-speak.`;
}

const EMPTY_BRIEF_STATE: BriefState = {
  id: "", session_id: "",
  background: null, problem_statement: null, business_goal: null,
  communication_goal: null, target_audience: null, insight: null,
  core_message: null, reasons_to_believe: null, tone_of_voice: null,
  visual_direction: null, deliverables: null, constraints: null,
  open_questions: null, confidence_scores: null,
  updated_at: "",
};

export function streamConversationResponse(
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  briefState: BriefState | null,
  analysisResult: AnalysisResult
) {
  const system = buildSystemPrompt(briefState ?? EMPTY_BRIEF_STATE, analysisResult);

  return streamText({
    model: CONVERSATION_MODEL,
    system,
    messages: conversationHistory.map((m) => ({ role: m.role, content: m.content })),
  });
}
