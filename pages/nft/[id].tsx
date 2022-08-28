import React from "react";
import GetServerSideProps from "next";
import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react";
import { sanityClient, urlFor } from "../../sanity";
import { Collection } from "../../typings";
import Link from "next/link";

interface Props {
  collection: Collection;
}

function NFTDropPage({ collection }: Props) {
  // Auth

  const connectWithMetamask = useMetamask();
  const disconnect = useDisconnect();
  const address = useAddress();

  return (
    <div className="flex h-screen flex-col lg:grid lg:grid-cols-10">
      {/* Left */}
      <div className="bg-gradient-to-br from-cyan-800 to-rose-500 lg:col-span-4">
        <div className="flex flex-col items-center justify-center py-2 lg:min-h-screen">
          <div className="bg-gradient-to-br from-yellow-400 to-purple-600 p-2 rounded-xl">
            <img
              className="w-44 rounded-xl object-cover lg:h-96 lg:w-72"
              src={urlFor(collection.mainImage).url()}
              alt=""
            />
          </div>
          <div className="space-y-2 p-5 text-center">
            <h1 className="text-4xl font-bold text-white">
              {collection.nftCollectionName}
            </h1>
            <h2 className="text-xl text-gray-300">{collection.description}</h2>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-1 flex-col p-12 lg:col-span-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href={"/"}>
            <h1 className="w-52 cursor-pointer text-xl font-extralight sm:w-80">
              The{" "}
              <span className="font-extrabold underline decoration-pink-600/50">
                HAMFAM
              </span>{" "}
              NFT Market Place
            </h1>
          </Link>
          <button
            onClick={() => (address ? disconnect() : connectWithMetamask())}
            className="rounded-full bg-rose-400 px-4 py-2 font-bold text-white lg:px-5 lg:py-3 lg:text-base"
          >
            {address ? "Sign Out" : "Sign In"}
          </button>
        </div>

        <hr className="my-2 border" />

        {address && (
          <p className="text-center text-sm text-rose-500">
            You&apos;re logged in with wallet {address.substring(0, 5)}...
            {address.substring(address.length - 5)}
          </p>
        )}

        {/* Content */}
        <div className="mt-10 flex flex-1 flex-col items-center space-y6 text-center lg:justify-center lg:space-y-8">
          <img
            className="w-80 object-cover pb-10 lg:h-40"
            src="https://links.papareact.com/bdy"
            alt=""
          />

          <h1 className="text-3xl font-bold lg:text-5xl lg:font-extralight">
            The HAMFAM ap Coding Club | NFT Drop
          </h1>

          <p className="pt-2 text-xl text-green-500">
            13 / 21 NFT&apos;s claimed
          </p>
        </div>

        {/* Mint Button */}

        <button className="mt-10 h-16 w-full bg-red-600 text-white rounded-full">
          Mint NFT (0.01 ETH)
        </button>
      </div>
    </div>
  );
}

export default NFTDropPage;

export const getServerSideProps: GetServerSideProps = async ({
  params,
}: any) => {
  const query = `*[_type == "collection" && slug.current == $slug][0]{
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

  const collection = await sanityClient.fetch(query, {
    slug: params?.id,
  });

  if (!collection) {
    return {
      notFound: true,
    };
  }

  console.log(collection);

  return {
    props: { collection },
  };
};
