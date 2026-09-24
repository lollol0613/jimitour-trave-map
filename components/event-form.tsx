import { createEvent } from "@/app/actions/event";

export default function EventForm() {
  return (
    <form
      action={createEvent}
      className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">이벤트명</label>
        <input
          name="name"
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">도시</label>
        <input
          name="city"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">월</label>
        <select
          name="event_month"
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        >
          <option value="">월 선택</option>
          <option value="1">1월</option>
          <option value="2">2월</option>
          <option value="3">3월</option>
          <option value="4">4월</option>
          <option value="5">5월</option>
          <option value="6">6월</option>
          <option value="7">7월</option>
          <option value="8">8월</option>
          <option value="9">9월</option>
          <option value="10">10월</option>
          <option value="11">11월</option>
          <option value="12">12월</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">시작일</label>
          <input
            type="date"
            name="start_date"
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">종료일</label>
          <input
            type="date"
            name="end_date"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">카테고리</label>
        <input
          name="category"
          placeholder="예: Marathon, Festival, Parade"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">태그</label>

        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              name="tags"
              value="Baby"
              className="h-4 w-4 rounded border-zinc-300"
            />

            <span>👶 Baby</span>
          </label>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">주소</label>
        <input
          name="address"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Latitude</label>
          <input
            name="latitude"
            type="number"
            step="any"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Longitude</label>
          <input
            name="longitude"
            type="number"
            step="any"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Website URL</label>
        <input
          name="website_url"
          type="url"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">이미지 업로드</label>

        <input
          name="image_file"
          type="file"
          accept="image/*"
          className="block w-full text-sm text-zinc-600
      file:mr-4
      file:rounded-md
      file:border-0
      file:bg-zinc-100
      file:px-4
      file:py-2
      file:text-sm
      file:font-medium
      hover:file:bg-zinc-200"
        />

        <p className="mt-1 text-xs text-zinc-500">URL or 업로드 가능</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">메모</label>
        <textarea
          name="memo"
          rows={4}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
      >
        이벤트 저장
      </button>
    </form>
  );
}
