import CalendarCard from "@/components/CalendarCard";
import { colors } from "@/lib/theme";

export default function HomePage() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        background: colors.pageBackground,
        color: colors.text,
        padding: "40px 24px 64px",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <CalendarCard />
      </div>
    </div>
  );
}
