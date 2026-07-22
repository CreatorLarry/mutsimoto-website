import type { AdminAboutPageContent, LeadershipProfile } from "@/types/company-content";

const fieldClass = "mt-2 h-11 w-full rounded-xl border border-[#d9e1e9] bg-white px-3 text-sm text-[#26364b] outline-none transition focus:border-[#e52833] focus:ring-2 focus:ring-[#e52833]/10";
const textAreaClass = "mt-2 min-h-28 w-full resize-y rounded-xl border border-[#d9e1e9] bg-white px-3 py-3 text-sm leading-6 text-[#26364b] outline-none transition focus:border-[#e52833] focus:ring-2 focus:ring-[#e52833]/10";
const labelClass = "text-[10px] font-black uppercase tracking-[0.11em] text-[#637186]";

interface AboutContentFormProps { action: (formData: FormData) => Promise<void>; content: AdminAboutPageContent }
interface LeadershipFormProps { action: (formData: FormData) => Promise<void>; leader?: LeadershipProfile; compact?: boolean }

function ContentSectionFields({ titleName, bodyName, titleLabel, titleValue, bodyValue }: { titleName: string; bodyName: string; titleLabel: string; titleValue: string; bodyValue: string }) {
  return <fieldset className="grid gap-4 rounded-2xl border border-[#e1e6ec] bg-[#f8fafb] p-4 sm:grid-cols-2"><legend className="px-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#d51f2a]">{titleLabel}</legend><label className={`${labelClass} sm:col-span-2`}>Section heading<input name={titleName} defaultValue={titleValue} required maxLength={180} className={fieldClass} /></label><label className={`${labelClass} sm:col-span-2`}>Section copy<textarea name={bodyName} defaultValue={bodyValue} required maxLength={5000} className={textAreaClass} /></label></fieldset>;
}

export function AboutContentForm({ action, content }: AboutContentFormProps) {
  return (
    <form action={action} className="space-y-5">
      <fieldset className="grid gap-4 sm:grid-cols-2"><legend className="sr-only">About page introduction</legend><label className={labelClass}>Page eyebrow<input name="eyebrow" defaultValue={content.eyebrow} required maxLength={100} className={fieldClass} /></label><label className={labelClass}>Main heading<input name="title" defaultValue={content.title} required maxLength={180} className={fieldClass} /></label><label className={`${labelClass} sm:col-span-2`}>Page summary<textarea name="summary" defaultValue={content.summary} required maxLength={500} className={textAreaClass} /></label></fieldset>
      <ContentSectionFields titleName="overviewTitle" bodyName="overviewBody" titleLabel="Company overview" titleValue={content.overviewTitle} bodyValue={content.overviewBody} />
      <ContentSectionFields titleName="expertiseTitle" bodyName="expertiseBody" titleLabel="Filtration expertise" titleValue={content.expertiseTitle} bodyValue={content.expertiseBody} />
      <div className="grid gap-4 xl:grid-cols-3"><ContentSectionFields titleName="oilFilterTitle" bodyName="oilFilterBody" titleLabel="Oil filters" titleValue={content.oilFilterTitle} bodyValue={content.oilFilterBody} /><ContentSectionFields titleName="fuelFilterTitle" bodyName="fuelFilterBody" titleLabel="Fuel filters" titleValue={content.fuelFilterTitle} bodyValue={content.fuelFilterBody} /><ContentSectionFields titleName="airFilterTitle" bodyName="airFilterBody" titleLabel="Air filters" titleValue={content.airFilterTitle} bodyValue={content.airFilterBody} /></div>
      <div className="grid gap-4 xl:grid-cols-3"><ContentSectionFields titleName="missionTitle" bodyName="missionBody" titleLabel="Mission" titleValue={content.missionTitle} bodyValue={content.missionBody} /><ContentSectionFields titleName="visionTitle" bodyName="visionBody" titleLabel="Vision" titleValue={content.visionTitle} bodyValue={content.visionBody} /><ContentSectionFields titleName="qualityTitle" bodyName="qualityBody" titleLabel="Quality commitment" titleValue={content.qualityTitle} bodyValue={content.qualityBody} /></div>
      <div className="flex flex-col gap-4 rounded-2xl border border-[#dce3eb] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><label className="flex items-start gap-3 text-xs font-bold leading-5 text-[#526176]"><input name="published" type="checkbox" defaultChecked={content.publicationStatus === "published"} className="mt-1 accent-[#d51f2a]" />Publish these changes on the public About page.</label><button type="submit" className="button-primary shrink-0">Save company content</button></div>
    </form>
  );
}

export function LeadershipForm({ action, leader, compact = false }: LeadershipFormProps) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {leader && <input type="hidden" name="leadershipId" value={leader.id} />}
      <label className={labelClass}>Full name<input name="fullName" defaultValue={leader?.fullName} required maxLength={160} placeholder="Leader's full name" className={fieldClass} /></label>
      <label className={labelClass}>Position / title<input name="leadershipTitle" defaultValue={leader?.title} required maxLength={160} placeholder="e.g. Chief Executive Officer" className={fieldClass} /></label>
      <label className={`${labelClass} sm:col-span-2`}>Biography<textarea name="biography" defaultValue={leader?.biography} required maxLength={5000} placeholder="Professional background, company role, and relevant experience." className={`${textAreaClass} min-h-36`} /></label>
      <label className={`${labelClass} sm:col-span-2`}>Leadership message<textarea name="message" defaultValue={leader?.message ?? ""} maxLength={3000} placeholder="Optional message to customers, partners, and the Mutsimoto team." className={textAreaClass} /></label>
      <label className={labelClass}>Display order<input name="displayOrder" type="number" min={0} max={1000} defaultValue={leader?.displayOrder ?? 0} className={fieldClass} /></label>
      <label className="flex items-start gap-3 rounded-xl border border-[#dce3eb] bg-[#f7f9fb] p-3 text-xs font-bold leading-5 text-[#526176]"><input name="published" type="checkbox" defaultChecked={leader?.published ?? false} className="mt-1 accent-[#d51f2a]" />Show this leader on the public About page.</label>
      <div className="sm:col-span-2"><button type="submit" className={compact ? "button-dark min-h-10 px-4 py-2 text-xs" : "button-primary"}>{leader ? "Save leadership profile" : "Add leadership profile"}</button></div>
    </form>
  );
}
