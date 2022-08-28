import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { sanityClient, urlFor } from "../sanity";
import styles from "../styles/Home.module.css";
import { Collection } from "../typings";

interface Props {
  collections: Collection[];
}

const Home = ({ collections }: Props) => {
  return (
    <div className="max-w-7xl mx-auto min-h-screen py-20 px-10 flex flex-col 2xl:px-0">
      <Head>
        <title>NFT Drop</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="w-52 cursor-pointer text-xl font-extralight sm:w-80">
        The{" "}
        <span className="font-extrabold underline decoration-pink-600/50">
          HAMFAM
        </span>{" "}
        NFT Market Place
      </h1>

      <main className="bg-slate-100 p-10 shadow-xl shadow-rose-400/20">
        <div className="grid space-x-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {collections.map((collection) => (
            <Link key={collection._id} href={`nft/${collection.slug.current}`}>
              <div
                className="flex flex-col items-center cursor-pointer transition-all duration-200
              hover:scale-105"
              >
                <img
                  className="h-96 w-60 rounded-2xl object-cover"
                  src={urlFor(collection.mainImage).url()}
                  alt=""
                />
                <div>
                  <h2 className="text-3xl">{collection.title}</h2>
                  <p className="mt-2 text-sm text-gray-400">
                    {collection.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const query = `*[_type == "collection"]{
    _id,
		title,
    address,
		description,
    nftCollectionName,
		creator -> {
			name,
			_id,
      address,
      slug {
        current
      }
		},
    slug {
      current
    },
    mainImage {
      asset
    },
    previewImage {
      asset
    }
    }`;

  const collections = await sanityClient.fetch(query);
  console.log(collections);
  return {
    props: { collections },
  };
};
