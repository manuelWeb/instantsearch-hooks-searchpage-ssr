import "../styles/globals.css";
import "instantsearch.css/themes/satellite-min.css";
import App, { AppContext, AppProps } from "next/app";
import Router, { useRouter } from "next/router";
import { useRef } from "react";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  InstantSearchSSRProvider,
} from "react-instantsearch-hooks-web";
import { SearchBoxBase } from "../components/SearchBox";
import { algoliaNextJsHistoryRouter } from "../components/router";
import { GoToHomeButton } from "../components/GoToHomeButton";
import { APP_ID, INSTANT_SEARCH_INDEX_NAME, SEARCH_API_KEY } from "../constants";

const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");
// const client = algoliasearch(APP_ID, SEARCH_API_KEY);

const onStateChange = async (params: any) => {
  if (
    Object.keys(params.uiState.instant_search).length > 0 &&
    Router.pathname !== "/search"
  ) {
    await Router.push("/search", undefined, { shallow: true });
  }

  params.setUiState(params.uiState);
};

const routing = (requestUrl: string) => ({
  router: algoliaNextJsHistoryRouter({
    getLocation() {
      if (typeof window === "undefined") {
        const url = new URL(requestUrl);
        return url;
      }

      return window.location as any;
    },
  }),
});

function MyApp({ Component, pageProps }: AppProps) {
  const initialResultsRef = useRef(pageProps.serverState?.initialResults);
  const routingRef = useRef(routing(pageProps.requestUrl));
  const router = useRouter();

  const goToSearch = () => {
    router.push("/search", undefined, { shallow: true });
  };

  return (
    <InstantSearchSSRProvider initialResults={initialResultsRef.current}>
      <InstantSearch
        searchClient={client}
        indexName="instant_search"
        onStateChange={onStateChange}
        routing={routingRef.current}
      >
        <SearchBoxBase />
        <GoToHomeButton />
        <button onClick={goToSearch}>go to search</button>
        <Component {...pageProps} />
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);

  const req = appContext.ctx.req;
  const isServer = Boolean(req);

  const Component = appContext.Component;

  const protocol = req?.headers.referer?.split("://")[0] || "https";
  const requestUrl = isServer
    ? `${protocol}://${req!.headers.host}${req!.url}`
    : null;

  let serverState = null;
  if (isServer) {
    const url = new URL(requestUrl!);

    if (url.pathname === "/search") {
      const reactInstantsearchHooksServer = await import(
        "react-instantsearch-hooks-server"
      );
      serverState = await reactInstantsearchHooksServer.getServerState(
        <MyApp
          router={{} as any}
          Component={Component}
          pageProps={{
            ...appProps.pageProps,
            requestUrl,
            serverState,
          }}
        />
      );
    }
  }

  return {
    ...appProps,
    pageProps: {
      ...appProps.pageProps,
      requestUrl,
      serverState,
    },
  };
};

export default MyApp;
