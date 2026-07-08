export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
