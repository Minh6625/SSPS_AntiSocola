import SPSOLayout from '@/components/SPSOLayout';

export default function SPSOPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SPSOLayout>{children}</SPSOLayout>;
}
