import sysadTranslation from "@/app/commonComponents/translation/sysadTranslation";
import { formatDate } from "@/app/commonComponents/utils/formatters";

/**
 * Translates log action to the appropriate language
 */
export function translateAction(action: string, language: "en" | "ceb" = "en"): string {
  const translations = sysadTranslation[language];
  const actionKey = `action_${action}` as keyof typeof translations;
  
  // Check if translation exists
  if (translations[actionKey]) {
    return translations[actionKey] as string;
  }
  
  // Fallback to original action if no translation found
  return action;
}

/**
 * Translates log description by matching common patterns
 */
export function translateDescription(description: string, language: "en" | "ceb" = "en"): string {
  if (!description) return description;
  
  const translations = sysadTranslation[language];
  const desc = description;

  // Pattern: "Created new user: Name (role)"
  if (desc.match(/^Created new user: /i)) {
    const match = desc.match(/^Created new user: (.+)$/i);
    if (match) {
      return `${translations.desc_Created_new_user}: ${match[1]}`;
    }
  }

  // Pattern: "Reset password for userId: XXX (Name)"
  if (desc.match(/^Reset password for userId:/i)) {
    const match = desc.match(/^Reset password for userId: (.+)$/i);
    if (match) {
      return `${translations.desc_Reset_password} userId: ${match[1]}`;
    }
  }

  // Pattern: "Uploaded profile picture for userId: XXX"
  if (desc.match(/^Uploaded profile picture for userId:/i)) {
    const match = desc.match(/^Uploaded profile picture for userId: (.+)$/i);
    if (match) {
      return `${translations.desc_Uploaded_profile_picture} userId: ${match[1]}`;
    }
  }

  // Pattern: "Removed profile picture for user..."
  if (desc.match(/^Removed profile picture for user/i)) {
    const match = desc.match(/^Removed profile picture for user (.+)$/i);
    if (match) {
      return `${translations.desc_Removed_profile_picture} user ${match[1]}`;
    }
  }

  // Pattern: "Name changed password for Name (userId)"
  if (desc.match(/ changed password for /i)) {
    const match = desc.match(/^(.+) changed password for (.+)$/i);
    if (match) {
      return `${match[1]} ${translations.desc_changed_password} ${match[2]}`;
    }
  }

  // Pattern: "Name updated email to email@example.com"
  if (desc.match(/ updated email to /i)) {
    const match = desc.match(/^(.+) updated email to (.+)$/i);
    if (match) {
      return `${match[1]} ${translations.desc_updated_email} ${match[2]}`;
    }
  }

  // Pattern: "Name updated phone number to XXX"
  if (desc.match(/ updated phone number to /i)) {
    const match = desc.match(/^(.+) updated phone number to (.+)$/i);
    if (match) {
      return `${match[1]} ${translations.desc_updated_phone_number} ${match[2]}`;
    }
  }

  // Pattern: "Name updated details for Name (userId)"
  if (desc.match(/ updated details for /i)) {
    const match = desc.match(/^(.+) updated details for (.+)$/i);
    if (match) {
      return `${match[1]} ${translations.desc_updated_details} ${match[2]}`;
    }
  }

  // Pattern: "New TYPE loan application submitted."
  if (desc.match(/^New .+ loan application submitted\.$/i)) {
    const match = desc.match(/^New (.+) loan application submitted\.$/i);
    if (match) {
      return `${translations.desc_New_loan_application} ${match[1]} ${translations.desc_loan_application_submitted}.`;
    }
  }

  // Pattern: "Updated loan application XXX: {...}"
  if (desc.match(/^Updated loan application /i)) {
    const match = desc.match(/^Updated loan application (.+)$/i);
    if (match) {
      return `${translations.desc_Updated_loan_application} ${match[1]}`;
    }
  }

  // Pattern: "Created new agent: Name (role)"
  if (desc.match(/^Created new agent:/i)) {
    const match = desc.match(/^Created new agent: (.+)$/i);
    if (match) {
      return `${translations.desc_Created_new_agent}: ${match[1]}`;
    }
  }

  // Pattern: "Deleted user..."
  if (desc.match(/^Deleted user /i)) {
    const match = desc.match(/^Deleted user (.+)$/i);
    if (match) {
      return `${translations.desc_Deleted_user} ${match[1]}`;
    }
  }

  // Pattern: "Scheduled interview for loan application APL00005 on 2025-11-14 at 10:58"
  if (desc.match(/^Scheduled interview for loan application /i)) {
    const match = desc.match(/^Scheduled interview for loan application (.+) on (.+) at (.+)$/i);
    if (match) {
      // Format the date using the formatDate function with language support
      const formattedDate = formatDate(match[2], language);
      return `${translations.desc_Scheduled_interview} ${match[1]} ${translations.desc_on} ${formattedDate} ${translations.desc_at} ${match[3]}`;
    }
  }

  // Fallback: return original description if no pattern matches
  return description;
}

