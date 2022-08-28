interface Image {
	assets: {
		url: string;
	};
}

interface Slug {
	current: string;
}

export interface Creator {
	_id: string;
	name: string;
	address: string;
    slug: Slug,
	bio: string;
	image: Image;

}


export interface Collection {
	_id: string;
	_createdAt: string;
	title: string;
	creator: Creator;
	description: string;
	address: string;
	nftCollectionName: string;
	mainImage: Image;
	slug: Slug;
    nftCollectionName: string,
    mainImage: Image,
    previewImage: Image;
}
