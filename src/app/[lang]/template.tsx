import { PageTransition } from "@/components/motion/PageTransition";

/** Re-mounts on every navigation, giving each page a soft, non-blocking entrance. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
