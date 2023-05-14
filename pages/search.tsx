import Head from "next/head";
import { Hit as AlgoliaHit } from "instantsearch.js";
import { Hits, Highlight, RefinementList } from "react-instantsearch-hooks-web";
import { Panel } from "../components/Panel";

type HitProps = {
  hit: AlgoliaHit<{
    name: string;
    price: number;
  }>;
};

function Hit({ hit }: HitProps) {
  return (
    <>
      <Highlight hit={hit} attribute="name" className="Hit-label" />
      <span className="Hit-price">${hit.price}</span>
    </>
  );
}

function RefinementFilter({ attribute }: { attribute: string }) {
  return (
    <Panel header={attribute}>
      <RefinementList attribute={attribute} />
    </Panel>
  );
}

export default function Search() {
  return (
    <>
      <Head>
        <title>Search</title>
      </Head>

      <div className="Container" style={{ display: 'flex' }}>
        <div>
          <RefinementFilter attribute="brand" />
          <RefinementFilter attribute="price" />
        </div>
        <div>
          <Hits hitComponent={Hit} />
        </div>
      </div>
    </>
  );
}
