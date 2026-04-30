import { updateHomeSettings } from "@/app/signal-control/actions";
import { adminFieldBase, type KvHomeSettings } from "./shared";

export function HomeSettingsPanel({ settings }: { settings: KvHomeSettings }) {
  return (
    <form action={updateHomeSettings} className="archive-card grid gap-3">
      <div className="grid gap-3 min-[760px]:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
        <label className="grid gap-1">
          <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
            Hero Eyebrow
          </span>
          <input className={adminFieldBase} defaultValue={settings.hero_eyebrow} name="hero_eyebrow" />
        </label>
        <label className="grid gap-1">
          <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
            Side Callout
          </span>
          <input className={adminFieldBase} defaultValue={settings.hero_aside} name="hero_aside" />
        </label>
      </div>
      <label className="grid gap-1">
        <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
          Hero Title
        </span>
        <textarea className={adminFieldBase} defaultValue={settings.hero_title} name="hero_title" rows={2} />
      </label>
      <label className="grid gap-1">
        <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
          Hero Body
        </span>
        <textarea className={adminFieldBase} defaultValue={settings.hero_body} name="hero_body" rows={3} />
      </label>
      <button className="button button-primary justify-self-start" type="submit">
        Save Front Signal
      </button>
    </form>
  );
}
