export type FeedbackCategory = 'suggestion' | 'bug_report' | 'feature_request';

export interface Feedback {
  id: string;
  user_name: string;
  email: string;
  feedback_text: string;
  category: FeedbackCategory;
  created_at: string;
}