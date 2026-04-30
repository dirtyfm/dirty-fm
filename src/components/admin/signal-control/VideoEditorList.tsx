import { deleteVideo, saveVideo } from "@/app/signal-control/actions";
import { adminFieldBase, type KvAdminVideo } from "./shared";

export function VideoEditorList({ videos }: { videos: KvAdminVideo[] }) {
  const statuses = ["featured", "unapproved", "raw clip", "archive file"];

  return (
    <div className="grid gap-4">
      {[null, ...videos].map((video, index) => (
        <article className="archive-card" key={video?.id ?? "new-video"}>
          <form action={saveVideo} className="grid gap-3">
            {video ? <input name="id" type="hidden" value={video.id} /> : null}
            <p className="card-label">{video ? "Edit Video File" : "Create Video File"}</p>
            <div className="grid gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_12rem_11rem]">
              <input className={adminFieldBase} defaultValue={video?.title ?? ""} name="title" placeholder="Title" />
              <input className={adminFieldBase} defaultValue={video?.youtube_id ?? ""} name="youtube_id" placeholder="YouTube ID" />
              <select className={adminFieldBase} defaultValue={video?.status ?? "archive file"} name="status">
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <textarea className={adminFieldBase} defaultValue={video?.description ?? ""} name="description" placeholder="Description" rows={3} />
            <div className="grid gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_11rem]">
              <input className={adminFieldBase} defaultValue={video?.category ?? "Video Trash"} name="category" placeholder="Category" />
              <input className={adminFieldBase} defaultValue={video?.host ?? "Drift"} name="host" placeholder="Host" />
              <input className={adminFieldBase} defaultValue={video?.published_at ?? new Date().toISOString()} name="published_at" />
            </div>
            <label className="flex items-center gap-2 font-utility text-xs font-black uppercase text-dirty-yellow">
              <input defaultChecked={video?.is_featured ?? index === 0} name="is_featured" type="checkbox" />
              Featured
            </label>
            <button className="button button-secondary justify-self-start" type="submit">
              {video ? "Save Video" : "File New Video"}
            </button>
          </form>
          {video ? (
            <form action={deleteVideo} className="mt-3">
              <input name="id" type="hidden" value={video.id} />
              <button className="danger-link" type="submit">Delete Video</button>
            </form>
          ) : null}
        </article>
      ))}
    </div>
  );
}
