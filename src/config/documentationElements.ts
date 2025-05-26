import { DocumentationElement } from '../types/documentation';

export const documentationElements: DocumentationElement[] = [
  {
    id: "D0700_social_isolation",
    question: "Identify the patient's actual or perceived lack of contact with other people, such as living alone or residing in a remote area.",
    context: "Use guidance for D0700: Social Isolation in the Oasis E1 manual"
  },
  {
    id: "M1830_bathing",
    question: "Identify the patient's ability to bathe their entire body and the assistance that may be required to safely bathe, including transferring in/out of the tub/shower.",
    context: "Use guidance for M1830: Bathing in the Oasis E1 manual"
  },
  {
    id: "GG0170_mobility",
    question: "Identify the patient's ability to perform basic self-care and mobility activities.",
    context: "Use guidance for GG0170 Mobility in the Oasis E1 manual"
  },
  {
    id: "vital_signs",
    question: "What are the patient's vital signs?",
    context: "Extract numerical values and units for each of these vital signs: heart rate, blood pressure, respiratory rate, and blood sugar level."
  },
  {
    id: "statement_of_summary",
    question: "Provide a Clinical Statement of Summary",
    context: "Extract a concise summary of the patient's medical history, including diagnoses, medications, and relevant test results"
  }
]; 