import ClasificacionClient from "./ClasificacionClient";

export const dynamic = 'force-dynamic';

export default function ClasificacionPage() {
  return (
    <div className="max-w-5xl mx-auto py-6">
      <ClasificacionClient />
    </div>
  );
}
