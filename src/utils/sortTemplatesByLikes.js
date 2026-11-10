export function sortTemplatesByLikes(templates, likes, sort = 'likes', downloads = {}, designId = template => template.id) {
  return [...templates].sort((a, b) => {
    const aId = designId(a);
    const bId = designId(b);
    const difference = sort === 'downloads' ? (downloads[bId] ?? 0) - (downloads[aId] ?? 0) : sort === 'likes' ? (likes[bId]?.count ?? 0) - (likes[aId]?.count ?? 0) : 0;
    const published = template => Date.parse(template.publishedAt ?? template.createdAt) || 0;
    return difference || (sort === 'oldest' ? published(a) - published(b) : published(b) - published(a));
  });
}
