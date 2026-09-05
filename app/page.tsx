import CalendarCard from "@/components/CalendarCard";
import StatCards from "@/components/StatCards";
import { colors } from "@/lib/theme";

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: colors.pageBackground,
        color: colors.text,
        padding: "40px 24px 64px",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <StatCards />
        <CalendarCard />
      </div>
    </div>
  );
}
