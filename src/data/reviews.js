export const reviews = [
  {
    id: 'review-vaclav',
    name: 'Vaclav',
    product: 'Custom cutting board',
    rating: 5,
    quote:
      'Beautiful cutting board! The mahogany strip is amazing and has this beautiful 3D effect. The colours match our kitchen perfectly and we couldn\'t be happier. Rubber feet were also added at our request, which we really appreciated. Great customer service.',
    shortQuote:
      'Beautiful cutting board! The mahogany strip is amazing and has this beautiful 3D effect.',
    tags: ['cutting-boards'],
    featured: true,
  },
  {
    id: 'review-kay',
    name: 'Kay',
    product: 'Handmade cutting boards',
    rating: 5,
    quote:
      'Dom is great. We love the cutting boards, and one issue caused by rough shipping was fixed really well. We\'re now talking to him about making a knife stand for our Japanese knives. Can\'t recommend him enough!',
    shortQuote:
      'We love the cutting boards, and one issue caused by rough shipping was fixed really well.',
    tags: ['cutting-boards'],
    featured: true,
  },
  {
    id: 'review-tran',
    name: 'Tran',
    product: 'Walnut, maple and purpleheart board',
    rating: 5,
    quote:
      'High-quality craftsmanship, absolutely stunning in person and exactly as depicted in the pictures. 5/5.',
    shortQuote: 'High-quality craftsmanship, absolutely stunning in person.',
    tags: ['cutting-boards'],
    featured: true,
  },
  {
    id: 'review-ido',
    name: 'Ido',
    product: 'Wall-mounted bottle openers',
    rating: 5,
    quote:
      'Saw the sale on Instagram and used the opportunity to buy two. Glad I did. They work exactly as intended, and I\'m happy I chose two different ones.',
    shortQuote:
      'They work exactly as intended, and I\'m happy I chose two different ones.',
    tags: ['bottle-openers'],
    featured: false,
  },
  {
    id: 'review-adriana',
    name: 'Adriana',
    product: 'Wood butter',
    rating: 5,
    quote:
      'Crazy fast shipping! I highly recommend this shop. The product is excellent and provides really good protection. Thank you very much!',
    shortQuote: 'The product is excellent and provides really good protection.',
    tags: ['wood-care'],
    featured: false,
  },
  {
    id: 'review-johnpaul',
    name: 'Johnpaul',
    product: 'Wood butter',
    rating: 5,
    quote: 'Great wood butter with a lovely smell.',
    shortQuote: 'Great wood butter with a lovely smell.',
    tags: ['wood-care'],
    featured: false,
  },
]

export const homepageReviews = reviews.filter((review) => review.featured)

export const reviewTrustPoints = [
  '5-star Etsy feedback',
  'Handmade in Prague',
  'Active since 2016',
  'Personal customer service',
]

const productReviewMap = {
  'natural-wood-butter-beeswax': 'review-johnpaul',
  'beeswax-wood-wax-natural-wood-conditioner': 'review-adriana',
  'walnut-maple-wall-mount-bottle-opener': 'review-ido',
  'walnut-wall-mount-bottle-opener': 'review-ido',
}

const cuttingBoardReviewIds = ['review-vaclav', 'review-kay', 'review-tran']

export function getReviewById(id) {
  return reviews.find((review) => review.id === id)
}

export function getProductSocialProof(product) {
  if (!product) return null

  const mappedId = productReviewMap[product.id]
  if (mappedId) {
    return getReviewById(mappedId)
  }

  if (product.category === 'Wood Care') {
    return getReviewById('review-johnpaul')
  }

  if (product.category === 'Cutting Boards' || product.category === 'Breadboards') {
    const index = product.id.length % cuttingBoardReviewIds.length
    return getReviewById(cuttingBoardReviewIds[index])
  }

  if (
    product.category === 'Wall Pieces' &&
    /bottle[\s-]?opener/i.test(`${product.id} ${product.name}`)
  ) {
    return getReviewById('review-ido')
  }

  return null
}
