import { redirect } from "next/navigation";

export default function IeltsBasicRedirectPage() {
  // Default to the listening lessons tab
  redirect("/ielts/basic/listening/lessons");
}
