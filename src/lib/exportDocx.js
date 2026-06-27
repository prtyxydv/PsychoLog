import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

export async function generatePatientRecordDocx(patient, logs) {
  const children = [
    new Paragraph({
      text: `PsychoLog Patient Record: ${patient.display_alias}`,
      heading: HeadingLevel.TITLE,
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: `Exported on: ${new Date().toLocaleDateString()}`,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `Therapy End Date: ${patient.therapy_end_date ? new Date(patient.therapy_end_date).toLocaleDateString() : 'N/A'}`,
      spacing: { after: 800 },
    }),
  ];

  if (logs.length === 0) {
    children.push(
      new Paragraph({
        text: "No logs available for this patient.",
        spacing: { after: 200 },
      })
    );
  } else {
    logs.forEach((log) => {
      // Date and Mood Header
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
          children: [
            new TextRun({
              text: `${new Date(log.submitted_at).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })} — Mood: ${log.mood_score}/10`,
              bold: true,
            }),
          ],
        })
      );

      // AI Summary
      children.push(
        new Paragraph({
          text: "AI Session Summary:",
          bold: true,
          spacing: { after: 100 },
        })
      );

      const summaryLines = log.ai_summary ? log.ai_summary.split("\n") : ["No summary available."];
      summaryLines.forEach((line) => {
        if (line.trim()) {
          children.push(
            new Paragraph({
              text: line.replace(/^[•*\-]\s*/, ""), // Strip bullets for clean docx bullets
              bullet: { level: 0 },
              spacing: { after: 100 },
            })
          );
        }
      });

      // Therapist Notes
      children.push(
        new Paragraph({
          text: "Therapist Notes:",
          bold: true,
          spacing: { before: 200, after: 100 },
        })
      );

      if (log.therapist_notes) {
        log.therapist_notes.split("\n").forEach((noteLine) => {
          children.push(
            new Paragraph({
              text: noteLine,
              spacing: { after: 100 },
            })
          );
        });
      } else {
        children.push(
          new Paragraph({
            text: "No notes added.",
            italics: true,
            spacing: { after: 100 },
          })
        );
      }

      children.push(
        new Paragraph({
          text: "--------------------------------------------------",
          spacing: { before: 200, after: 200 },
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}
