import useSWR from 'swr';
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function EventList() {
  const { data, error } = useSWR('/api/events', fetcher);
  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <ul>
      {data.map((event) => (
        <li key={event.id}>{event.name}</li>
      ))}
    </ul>
  );
}