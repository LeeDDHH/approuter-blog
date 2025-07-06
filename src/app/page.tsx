export default function Home() {
  console.log("Rendering Home Component");
  return (
    <main className="flex flex-col gap-2 items-center">
      <h1 className="text-4xl font-bold text-center sm:text-left">
        Welcome to my Website
      </h1>
    </main>
  );
}