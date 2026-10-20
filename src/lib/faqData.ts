import faqData from './faqData.json';

export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = faqData;
