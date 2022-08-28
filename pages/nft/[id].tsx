import React, { useCallback, useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import {
  useAddress,
  useDisconnect,
  useMetamask,
  useNFTDrop,
} from "@thirdweb-dev/react";
import { sanityClient, urlFor } from "../../sanity";
import { Collection } from "../../typings";
import Link from "next/link";
import { BigNumber } from "ethers";
import toast, { Toaster } from "react-hot-toast";

interface Props {
  collection: Collection;
}

function NFTDropPage({ collection }: Props) {
  // collection supplied
  const [claimedSupply, setClaimedSupply] = useState<number>(0);
  const [priceInEth, setPriceInEth] = useState<string>();
  const [totalSupply, setTotalSupply] = useState<BigNumber>();
  const [loading, setLoading] = useState<boolean>(false);

  // Auth
  const connectWithMetamask = useMetamask();
  const disconnect = useDisconnect();
  const address = useAddress();
  // ---

  // NftDrop
  const nftDrop = useNFTDrop(collection.address);

  const fetchNftDropData = useCallback(async () => {
    if (!nftDrop) return;
    setLoading(true);
    const claimed = await nftDrop.getAllClaimed();
    const total = await nftDrop.totalSupply();

    setClaimedSupply(claimed?.length);
    setTotalSupply(total);
    setLoading(false);
  }, [nftDrop]);

  useEffect(() => {
    if (!nftDrop) return;

    const fetchPrice = async () => {
      const claimConditions = await nftDrop.claimConditions.getAll();
      setPriceInEth(claimConditions?.[0].currencyMetadata.displayValue);
    };
    fetchNftDropData();
    fetchPrice();
  }, [nftDrop]);

  const maintNFT = () => {
    if (!nftDrop || !address) return;

    const quantity = 1; // how many unique NFT to claim
    setLoading(true);
    const notification = toast.loading("Minting...", {
      style: {
        background: "white",
        color: "green",
        fontWeight: "bolder",
        padding: "20px",
        fontSize: "17px",
      },
    });

    nftDrop
      .claimTo(address, quantity)
      .then(async (tx) => {
        const receipt = tx[0].receipt;
        const claimedTokenId = tx[0].id;
        const claimedNFT = await tx[0].data();

        toast("HOORAY..You Succesfully Minted!", {
          duration: 8000,
          style: {
            background: "green",
            color: "white",
            fontWeight: "bolder",
            padding: "20px",
            fontSize: "17px",
          },
        });
        fetchNftDropData();
      })
      .catch((error) => {
        console.error(error);
        toast("Whoops..Something went wrong!", {
          style: {
            background: "red",
            color: "white",
            fontWeight: "bolder",
            padding: "20px",
            fontSize: "17px",
          },
        });
      })
      .finally(() => {
        setLoading(false);
        toast.dismiss(notification);
      });
  };

  return (
    <div className="flex h-screen flex-col lg:grid lg:grid-cols-10">
      <Toaster position="bottom-center" />
      {/* Left */}
      <div className="bg-gradient-to-br from-cyan-800 to-rose-500 lg:col-span-4">
        <div className="flex flex-col items-center justify-center py-2 lg:min-h-screen">
          <div className="bg-gradient-to-br from-yellow-400 to-purple-600 p-2 rounded-xl">
            <img
              className="w-44 rounded-xl object-cover lg:h-96 lg:w-72"
              src={urlFor(collection.previewImage).url()}
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
          {loading ? (
            <p className="text-xl pt-2 text-green-500 animate-pulse">
              loading supply count...
            </p>
          ) : (
            <p className="pt-2 text-xl text-green-500">
              {claimedSupply} / {totalSupply?.toString()} NFT&apos;s claimed
            </p>
          )}

          {loading && (
            <img
              className="h-80 w-80 object-contain"
              src="https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif"
              alt=""
            />
          )}
        </div>

        {/* Mint Button */}

        <button
          onClick={maintNFT}
          disabled={
            loading || claimedSupply === totalSupply?.toNumber() || !address
          }
          className="mt-10 h-16 w-full bg-red-600 text-white rounded-full disabled:bg-gray-400"
        >
          {loading ? (
            "Loading"
          ) : claimedSupply === totalSupply?.toNumber() ? (
            "SOLD OUT"
          ) : !address ? (
            "Sign In to Mint"
          ) : (
            <span>Mint NFT ({priceInEth} ETH)</span>
          )}
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

  return {
    props: { collection },
  };
};
