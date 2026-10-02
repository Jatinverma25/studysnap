import { GithubCalendar } from "@/components/ui/retro-space-shooter-git-hub-calendar";

const settings = {
  cellSize: 15,
  cellGap: 4,
};

export default function GithubCalendarPreview(props: Partial<typeof settings>) {
  const s = { ...settings, ...props };
  return (
    <GithubCalendar
      username="Jahirul077"
      cellSize={s.cellSize}
      cellGap={s.cellGap}
    />
  );
}
