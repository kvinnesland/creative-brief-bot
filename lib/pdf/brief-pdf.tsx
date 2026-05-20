// CR-004: PDF document component — @react-pdf/renderer, server-side only.

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { BriefState } from "@/lib/types/entities";

const GOLD = "#B8962E";
const DARK = "#1A1A1A";
const MID = "#555550";
const LIGHT = "#888882";
const RULE = "#E8E4DC";

const s = StyleSheet.create({
  page: {
    backgroundColor: "#FAFAF8",
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 56,
    fontFamily: "Helvetica",
    color: DARK,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 32,
  },
  wordmark: {
    fontSize: 8,
    letterSpacing: 2.5,
    color: GOLD,
    fontFamily: "Helvetica",
    textTransform: "uppercase",
  },
  headerDate: {
    fontSize: 8,
    color: LIGHT,
    letterSpacing: 0.5,
  },

  // Title block
  titleRule: {
    borderBottomWidth: 1,
    borderBottomColor: RULE,
    marginBottom: 20,
  },
  title: {
    fontFamily: "Times-Roman",
    fontSize: 30,
    fontWeight: 500,
    color: DARK,
    lineHeight: 1.2,
    letterSpacing: -0.5,
    marginBottom: 24,
  },

  // Section
  section: {
    marginBottom: 22,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
  },
  sectionLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  sectionLabel: {
    fontSize: 7.5,
    letterSpacing: 1.8,
    color: LIGHT,
    textTransform: "uppercase",
    fontFamily: "Helvetica",
    marginBottom: 7,
  },
  sectionValue: {
    fontSize: 11.5,
    lineHeight: 1.75,
    color: DARK,
    fontFamily: "Helvetica",
  },
  sectionEmpty: {
    fontSize: 11.5,
    lineHeight: 1.75,
    color: LIGHT,
    fontFamily: "Helvetica",
    fontStyle: "italic",
  },

  // List items
  listItem: {
    flexDirection: "row",
    marginBottom: 5,
  },
  listBullet: {
    fontSize: 11.5,
    color: GOLD,
    marginRight: 10,
    lineHeight: 1.75,
  },
  listText: {
    fontSize: 11.5,
    lineHeight: 1.75,
    color: DARK,
    fontFamily: "Helvetica",
    flex: 1,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 32,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7.5,
    color: LIGHT,
    letterSpacing: 0.5,
  },
  footerGold: {
    fontSize: 7.5,
    color: GOLD,
    letterSpacing: 0.5,
  },
});

interface Props {
  title?: string;
  briefState: BriefState;
  generatedDate: string;
}

export function BriefDocument({ title, briefState, generatedDate }: Props) {
  const deliverables = briefState.deliverables ?? [];
  const constraints = briefState.constraints ?? [];

  const hasDeliverables = deliverables.length > 0;
  const hasConstraints = constraints.length > 0;

  const textSections: { label: string; value: string | null }[] = [
    { label: "Bakgrunn og kontekst",        value: briefState.background },
    { label: "Kommunikasjonsbarrieren",     value: briefState.problem_statement },
    { label: "Forretningsmål",              value: briefState.business_goal },
    { label: "Kommunikasjonsmål",           value: briefState.communication_goal },
    { label: "Målgruppe",                   value: briefState.target_audience },
    { label: "Innsikt",                     value: briefState.insight },
    { label: "Hovedbudskap",               value: briefState.core_message },
    { label: "Sannhetsbevis (RTB)",         value: briefState.reasons_to_believe },
    { label: "Tone of voice og stil",       value: briefState.tone_of_voice },
  ];

  const lastSectionIndex =
    hasConstraints
      ? -1
      : hasDeliverables
      ? -1
      : textSections.length - 1;

  return (
    <Document
      title={title ?? "Creative Brief"}
      author="Creative Brief"
      creator="Creative Brief"
    >
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.headerRow}>
          <Text style={s.wordmark}>Creative Brief</Text>
          <Text style={s.headerDate}>{generatedDate}</Text>
        </View>

        {/* Title */}
        <Text style={s.title}>{title ?? "Untitled Brief"}</Text>
        <View style={s.titleRule} />

        {/* Text sections */}
        {textSections.map(({ label, value }, i) => {
          const isLast = i === lastSectionIndex && !hasDeliverables && !hasConstraints;
          return (
            <View key={label} style={isLast ? s.sectionLast : s.section}>
              <Text style={s.sectionLabel}>{label}</Text>
              {value ? (
                <Text style={s.sectionValue}>{value}</Text>
              ) : (
                <Text style={s.sectionEmpty}>Ikke definert ennå</Text>
              )}
            </View>
          );
        })}

        {/* Deliverables */}
        {hasDeliverables && (
          <View style={hasConstraints ? s.section : s.sectionLast}>
            <Text style={s.sectionLabel}>Leveranser og kanaler</Text>
            {deliverables.map((item, i) => (
              <View key={i} style={s.listItem}>
                <Text style={s.listBullet}>—</Text>
                <Text style={s.listText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Constraints */}
        {hasConstraints && (
          <View style={s.sectionLast}>
            <Text style={s.sectionLabel}>Rammer og begrensninger</Text>
            {constraints.map((item, i) => (
              <View key={i} style={s.listItem}>
                <Text style={s.listBullet}>—</Text>
                <Text style={s.listText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerGold}>Creative Brief</Text>
          <Text style={s.footerText}>
            <Text render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            } />
          </Text>
        </View>
      </Page>
    </Document>
  );
}
