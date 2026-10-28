// Keep clicks immediate while serializing writes, including repeated toggles on one message.
export function createFeedbackMutations({ request, publish, onError }) {
  const fields = new Map();
  const records = new Map();
  let queue = Promise.resolve();
  let revision = 0;
  return {
    idle: () => queue,
    version: () => revision,
    clear: () => { fields.clear(); records.clear(); },
    change(items, changes) {
      const field = Object.keys(changes)[0];
      const value = changes[field];
      const operations = items.map(item => {
        const key = `${item.id}:${field}`;
        const current = { ...item, ...records.get(item.id) };
        const entry = fields.get(key) || { confirmed: current[field], desired: current[field], version: 0 };
        const previous = { ...current, [field]: entry.desired };
        entry.desired = value; entry.version++;
        fields.set(key, entry);
        records.set(item.id, { ...records.get(item.id), [field]: value });
        publish(previous, { ...previous, [field]: value });
        return { item: previous, entry, version: entry.version };
      });
      revision++;
      queue = queue.then(async () => {
        try {
          await request('feedback-bulk', { ids: items.map(item => item.id), ...changes });
          for (const { entry } of operations) entry.confirmed = value;
        } catch {
          for (const { item, entry, version } of operations) {
            if (entry.version !== version) continue;
            const previous = { ...item, ...records.get(item.id), [field]: entry.desired };
            entry.desired = entry.confirmed;
            records.set(item.id, { ...records.get(item.id), [field]: entry.confirmed });
            publish(previous, { ...previous, [field]: entry.confirmed });
          }
          revision++;
          onError('Could not save your changes. The affected messages were restored. Please try again.');
        }
      });
      return queue;
    },
  };
}
