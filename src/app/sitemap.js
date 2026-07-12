export default function sitemap() {
  return [
    {
      url: 'https://cafemuseo.ph',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://cafemuseo.ph/reviews',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}
