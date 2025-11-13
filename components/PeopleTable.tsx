import { useEffect, useState } from 'react';

interface Person {
  id: number;
  name: string;
  surname: string;
  email: string;
}

export default function PeopleTable() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/people')
      .then((res) => {
        if (!res.ok) throw new Error('Errore nella fetch');
        return res.json();
      })
      .then((data) => {
        console.log('People API result:', data);
        setPeople(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Errore fetch /api/people:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <table className="min-w-full text-left">
      <thead>
        <tr>
          <th className="border-b px-4 py-2">ID</th>
          <th className="border-b px-4 py-2">Name</th>
          <th className="border-b px-4 py-2">Surname</th>
          <th className="border-b px-4 py-2">Email</th>
        </tr>
      </thead>
      <tbody>
        {people.map((person) => (
          <tr key={person.id}>
            <td className="border-b px-4 py-2 text-sm">{person.id}</td>
            <td className="border-b px-4 py-2 text-sm">{person.name}</td>
            <td className="border-b px-4 py-2 text-sm">{person.surname}</td>
            <td className="border-b px-4 py-2 text-sm font-bold">
              {person.email}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
