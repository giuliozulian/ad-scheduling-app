import { useState } from 'react';

export interface Person {
  id: number;
  name: string;
  surname: string;
  email: string;
  level?: string;
  team?: string;
}

export default function EditPersonForm({
  person,
  onClose,
  onSave,
}: {
  person: Person;
  onClose: () => void;
  onSave: (p: Person) => void;
}) {
  const [form, setForm] = useState({
    name: person.name,
    surname: person.surname,
    email: person.email,
    team: person.team || '',
    level: person.level || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/people/${person.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Errore salvataggio');
      const updated = await res.json();
      onSave(updated);
    } catch {
      setError('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold">Nome</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded border px-2 py-1 text-sm dark:bg-[#232326] dark:text-gray-100"
            required
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold">Cognome</label>
          <input
            name="surname"
            value={form.surname}
            onChange={handleChange}
            className="w-full rounded border px-2 py-1 text-sm dark:bg-[#232326] dark:text-gray-100"
            required
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full rounded border px-2 py-1 text-sm dark:bg-[#232326] dark:text-gray-100"
          required
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold">Team</label>
          <input
            name="team"
            value={form.team}
            onChange={handleChange}
            className="w-full rounded border px-2 py-1 text-sm dark:bg-[#232326] dark:text-gray-100"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold">Livello</label>
          <input
            name="level"
            value={form.level}
            onChange={handleChange}
            className="w-full rounded border px-2 py-1 text-sm dark:bg-[#232326] dark:text-gray-100"
          />
        </div>
      </div>
      {error && <div className="text-xs text-red-500">{error}</div>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded bg-gray-200 px-3 py-1 text-sm dark:bg-[#232326] dark:text-gray-100"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white dark:bg-blue-500"
        >
          {saving ? 'Salva...' : 'Salva'}
        </button>
      </div>
    </form>
  );
}
