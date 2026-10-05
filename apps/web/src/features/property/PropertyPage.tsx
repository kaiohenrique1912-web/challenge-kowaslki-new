import {
  formatBRL,
  formatMonthlyYield,
  formatPublishedAgo,
  monthlyCostLabel,
  priceSummary,
  propertyFeatures,
} from "@qa/shared";
import {
  AddressCard,
  AmenityList,
  Badge,
  Breadcrumb,
  Button,
  ExpandableText,
  FavoriteButton,
  Icon,
  IconButton,
  PriceSummary,
  PropertyFeatures,
  PropertyGallery,
  Skeleton,
  StatusMessage,
} from "@qa/ui";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { lastSearchUrl } from "../../lib/navigation.ts";
import { useToggleFavorite } from "../favorites/use-favorites.ts";
import { useOutOfScope } from "../layout/out-of-scope.tsx";
import { SiteHeader } from "../layout/SiteHeader.tsx";
import { PropertyLocationMap } from "./PropertyLocationMap.tsx";
import { usePropertyDetail } from "./queries.ts";
import "../../styles/map-markers.css";
import "./property-page.css";

/** "Voltar para a busca": volta no histórico se veio da busca (mantém filtros e rolagem). */
function useBackToSearch(neighborhoodSlug: string | undefined) {
  const navigate = useNavigate();
  const location = useLocation();
  const cameFromSearch = (location.state as { fromSearch?: boolean } | null)?.fromSearch === true;
  return () => {
    if (cameFromSearch) {
      navigate(-1);
      return;
    }
    const last = lastSearchUrl();
    navigate(
      last ?? (neighborhoodSlug ? `/comprar/imovel/${neighborhoodSlug}` : "/comprar/imovel"),
    );
  };
}

/** Compartilhar: menu nativo quando existe; senão copia o link. */
function useShare() {
  const [copied, setCopied] = useState(false);
  const share = async (title: string) => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // usuário cancelou ou o navegador bloqueou: nada a fazer
    }
  };
  return { share, copied };
}

function DetailSkeleton() {
  return (
    <div className="property-page" aria-busy="true">
      <div className="property-hero">
        <div className="property-hero__info">
          <Skeleton width="80%" height={44} />
          <Skeleton width="60%" height={44} />
          <Skeleton width="40%" height={32} />
        </div>
        <Skeleton shape="rect" height={420} />
      </div>
      <span className="qa-visually-hidden" role="status">
        Carregando imóvel
      </span>
    </div>
  );
}

/** Página de detalhe do imóvel (/imovel/:id) — ver docs/business-rules.md §6. */
export function PropertyPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const detail = usePropertyDetail(id);
  const property = detail.data;
  const toggleFavorite = useToggleFavorite();
  const back = useBackToSearch(property?.neighborhood.slug);
  const { share, copied } = useShare();
  const notAvailable = useOutOfScope();
  const mapRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (property) document.title = `${property.headline} — Imóvel ${property.id}`;
  }, [property]);

  const backButton = (
    <Button variant="link" iconLeft="arrowLeft" onClick={back} className="property-back">
      Voltar para a busca
    </Button>
  );

  if (detail.isPending) {
    return (
      <>
        <SiteHeader variant="detail" />
        <DetailSkeleton />
      </>
    );
  }
  if (detail.isError) {
    return (
      <>
        <SiteHeader variant="detail" />
        <StatusMessage
          tone="error"
          title="Não foi possível carregar o imóvel"
          description={detail.error.message}
          action={
            <Button variant="secondary" onClick={() => detail.refetch()}>
              Tentar novamente
            </Button>
          }
        />
      </>
    );
  }
  if (!property) {
    return (
      <>
        <SiteHeader variant="detail" />
        <StatusMessage
          icon="search"
          title="Imóvel não encontrado"
          description={`O imóvel ${id} não existe ou não está mais à venda.`}
          action={<Button onClick={back}>Voltar para a busca</Button>}
        />
      </>
    );
  }

  const summary = priceSummary(property);
  const place = `${property.neighborhood.name}, São Paulo`;
  const showMap = () => mapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  const favoriteProps = {
    favorite: property.isFavorite,
    onToggle: (favorite: boolean) => toggleFavorite(property.id, favorite),
  };

  return (
    <>
      <SiteHeader variant="detail" />
      <main className="property-page">
        <section className="property-hero">
          <div className="property-hero__info">
            {backButton}
            <h1 className="property-hero__title">{property.headline}</h1>
            <div className="property-hero__price">
              {property.previousPrice && property.previousPrice > property.salePrice && (
                <s className="property-hero__previous">{formatBRL(property.previousPrice)}</s>
              )}
              <p className="property-hero__sale">Venda {formatBRL(property.salePrice)}</p>
              <p className="property-hero__monthly">{monthlyCostLabel(property.monthlyCost)}</p>
            </div>
            <div className="property-hero__actions">
              <Button onClick={() => notAvailable("Agendar visita")}>Agendar visita</Button>
              <Button
                variant="outline"
                iconLeft="chat"
                onClick={() => notAvailable("Converse conosco agora")}
              >
                Converse conosco agora
              </Button>
            </div>
          </div>
          <PropertyGallery
            photos={property.photos.map((p) => p.url)}
            alt={property.headline}
            onShowMap={showMap}
            actions={
              <>
                <IconButton
                  icon="share"
                  label={copied ? "Link copiado" : "Compartilhar"}
                  variant="surface"
                  onClick={() => share(property.headline)}
                />
                <FavoriteButton {...favoriteProps} variant="surface" />
              </>
            }
          />
        </section>

        <div className="property-body">
          <div className="property-body__main">
            <Breadcrumb
              items={[
                { label: "Início", href: "/comprar/imovel" },
                { label: "São Paulo", href: "/comprar/imovel" },
                {
                  label: property.neighborhood.name,
                  href: `/comprar/imovel/${property.neighborhood.slug}`,
                },
                { label: property.street, href: `/comprar/imovel/${property.neighborhood.slug}` },
                { label: `Imóvel ${property.id}` },
              ]}
              onNavigate={(event, href) => {
                event.preventDefault();
                navigate(href);
              }}
            />
            <div className="property-address">
              <AddressCard street={property.street} place={place} onClick={showMap} />
            </div>
            <PropertyFeatures features={propertyFeatures(property)} />
            <div className="property-meta">
              <Badge>Imóvel {property.id}</Badge>
              {property.publishedAt && (
                <span className="property-meta__date">
                  <Icon name="clock" size={14} />
                  {formatPublishedAgo(property.publishedAt)}
                </span>
              )}
            </div>
            <section className="property-section">
              <h2 className="property-section__title">Descrição do proprietário</h2>
              <ExpandableText text={property.description} />
            </section>
            <section className="property-section">
              <AmenityList
                available={property.amenities}
                unavailable={property.unavailableAmenities}
              />
            </section>
            <section className="property-section" ref={mapRef} id="localizacao">
              <h2 className="property-section__title">Localização</h2>
              <p className="property-section__hint">
                {property.street}, {place}. A posição no mapa é aproximada.
              </p>
              <PropertyLocationMap
                lat={property.location.lat}
                lng={property.location.lng}
                label={`${property.street}, ${place}`}
              />
            </section>
          </div>

          <div className="property-body__aside">
            <PriceSummary
              rows={summary.rows}
              total={summary.total}
              note={
                property.isRented && property.monthlyRent
                  ? `Já alugado por ${formatBRL(property.monthlyRent)}/mês (${formatMonthlyYield(property.rentalYield)}).`
                  : `Retorno estimado com aluguel: ${formatMonthlyYield(property.rentalYield)} (≈ ${formatBRL(property.estimatedRent)}/mês).`
              }
              actions={
                <>
                  <Button fullWidth onClick={() => notAvailable("Agendar visita")}>
                    Agendar visita
                  </Button>
                  <Button
                    fullWidth
                    variant="secondary"
                    onClick={() => notAvailable("Fazer proposta")}
                  >
                    Fazer proposta
                  </Button>
                </>
              }
              footer={
                <>
                  <FavoriteButton {...favoriteProps} showLabel />
                  <Button variant="ghost" iconLeft="share" onClick={() => share(property.headline)}>
                    {copied ? "Link copiado!" : "Compartilhar"}
                  </Button>
                </>
              }
            />
          </div>
        </div>
      </main>
    </>
  );
}
