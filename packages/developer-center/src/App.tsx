import { useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { Shell } from './shell/Shell';
import { SECTIONS, redirectFor, sectionPages, slug } from './data/nav';
import { NotYetWritten } from './modules';
import { system } from './data/generated';

import { Home } from './pages/Home';
import { Foundations } from './pages/Foundations';
import { Color } from './pages/Color';
import { Typography, Spacing, LayoutGrid } from './pages/FoundationArticles';
import {
  ResponsiveDesign, Breakpoints, Radius, ElevationShadows, Iconography, Motion, Imagery,
} from './pages/FoundationArticles2';
import { TokenArchitecture, TokenReference } from './pages/Tokens';
import {
  Primitives, BrandTokens, SemanticTokens, ResponsiveTokens, ComponentTokens,
} from './pages/TokenLayers';
import {
  Theming, ThemingContract, ThemingAuthoring, ThemingApplying, ThemingValidation, ThemingDesigning,
} from './pages/Theming';
import {
  NamingConventions, FigmaVariables, DTCG, StyleDictionary, CssTokens, TypeScriptTokens,
  TokenPipeline, UsingTokens,
} from './pages/TokenTechnical';
import { TokensLanding } from './pages/TokensLanding';
import { ComponentsOverview, ComponentCategory, ComponentPage } from './pages/Components';
import {
  ComponentAnatomy, VariantsAndStates, ComponentResponsive, ComponentAccessibility, UsageGuidelines,
} from './pages/ComponentGuides';
import { Selection } from './pages/Patterns';
import {
  PatternsLanding, NavigationPattern, FormsPattern, FilteringPattern,
  SearchPattern, EmptyStates, LoadingPattern, ErrorsPattern, ConfirmationPattern,
  ProgressiveDisclosure, ResponsivePatterns, ComplexWorkflows,
} from './pages/PatternPages';
import { FocusManagement } from './pages/Accessibility';
import {
  AccessibilityLanding, A11yPrinciples, Wcag, Contrast, KeyboardNavigation,
  ScreenReaders, SemanticStructure, AccessibleForms, A11yMotion, A11yTesting,
} from './pages/A11yPages';
import {
  ContentLanding, VoiceAndTone, WritingPrinciples, UiCopy, Labels, ActionsCopy, FormsCopy,
  ErrorsCopy, EmptyStatesCopy, NotificationsCopy, Terminology, InclusiveLanguage,
} from './pages/ContentPages';
import {
  ResourcesLanding, FigmaResource, StorybookResource, TokensResource, PackagesResource,
  IconsResource, TemplatesResource, ReleasesResource, ChangelogResource, SupportResource,
} from './pages/ResourcePages';
import {
  GovernanceLanding, Maintenance, Ownership, RequestingAComponent, ProposingAChange,
  DesignReview, EngineeringReview, AccessibilityReview, Lifecycle, Versioning, Deprecation,
  Releases, Adoption, Roadmap,
} from './pages/GovernancePages';
import { ContributionModel } from './pages/Governance';
import {
  GettingStartedLanding, Introduction, WhatIsEnvision, Principles, HowTheSystemWorks,
} from './pages/GettingStarted';
import {
  Designers, Developers, Installation, FigmaLibraries, StorybookGuide, Contributing,
} from './pages/GettingStartedRoles';

/**
 * Scroll and focus on navigation.
 *
 * In a single-page application the browser does not reset focus when the route changes, so focus
 * would stay on a link that no longer exists and a screen reader would announce nothing. Focus is
 * moved to the main landmark, which is the behavior the Focus management page documents. It is
 * skipped on the first render so the page does not steal focus from a deep link on load.
 */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  const firstRender = useRef(true);

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    window.scrollTo(0, 0);
    if (firstRender.current) { firstRender.current = false; return; }
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname, hash]);

  return null;
}

/**
 * Any route declared in the information architecture but not yet written resolves here, so the
 * navigation stays honest: the page exists in the plan, and the site says plainly that it has no
 * content rather than padding it out (Part LVI).
 */
function Pending() {
  const { pathname } = useLocation();

  // A link from before the restructure is not a missing page, it is a moved one.
  const moved = redirectFor(pathname);
  if (moved) return <Navigate to={moved} replace />;

  for (const s of SECTIONS) {
    // Finished siblings, so an unwritten page still hands the reader somewhere useful.
    const finished = sectionPages(s)
      .filter((c) => c.built && c.path !== pathname)
      .map((c) => ({ title: c.title, to: c.path, note: c.summary }));

    const child = sectionPages(s).find((c) => c.path === pathname);
    if (child) {
      return (
        <NotYetWritten
          title={child.title}
          section={s.title}
          willCover={child.summary ? `This page will cover ${child.summary}` : undefined}
          alternatives={finished}
          trail={[{ label: 'Envision Design System', to: '/' }, { label: s.title, to: s.built ? s.path : undefined }, { label: child.title }]}
        />
      );
    }
    if (s.path === pathname) {
      return (
        <NotYetWritten
          title={s.title}
          section={s.title}
          alternatives={finished}
          trail={[{ label: 'Envision Design System', to: '/' }, { label: s.title }]}
        />
      );
    }
  }
  return (
    <NotYetWritten
      title="Page not found"
      section="Envision Design"
      trail={[{ label: 'Envision Design System', to: '/' }, { label: 'Not found' }]}
    />
  );
}

/** Resolves /components/:name against the registry so a bad slug cannot render an empty page. */
function ComponentRoute() {
  const { name } = useParams();
  const component = system.components.find((c) => !c.internal && slug(c.name) === name);
  if (!component) return <Pending />;
  return <ComponentPage component={component} />;
}

export function App() {
  return (
    <Shell>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/get-started" element={<GettingStartedLanding />} />
        <Route path="/get-started/introduction" element={<Introduction />} />
        <Route path="/get-started/what-is-envision" element={<WhatIsEnvision />} />
        <Route path="/get-started/principles" element={<Principles />} />
        <Route path="/get-started/how-the-system-works" element={<HowTheSystemWorks />} />
        <Route path="/get-started/designers" element={<Designers />} />
        <Route path="/get-started/developers" element={<Developers />} />
        <Route path="/get-started/installation" element={<Installation />} />
        <Route path="/get-started/figma" element={<FigmaLibraries />} />
        <Route path="/get-started/storybook" element={<StorybookGuide />} />
        <Route path="/get-started/contributing" element={<Contributing />} />

        <Route path="/foundations" element={<Foundations />} />
        <Route path="/foundations/color" element={<Color />} />
        <Route path="/foundations/typography" element={<Typography />} />
        <Route path="/foundations/spacing" element={<Spacing />} />
        <Route path="/foundations/layout-grid" element={<LayoutGrid />} />
        <Route path="/foundations/responsive-design" element={<ResponsiveDesign />} />
        <Route path="/foundations/breakpoints" element={<Breakpoints />} />
        <Route path="/foundations/radius" element={<Radius />} />
        <Route path="/foundations/elevation-shadows" element={<ElevationShadows />} />
        <Route path="/foundations/iconography" element={<Iconography />} />
        <Route path="/foundations/motion" element={<Motion />} />
        <Route path="/foundations/imagery" element={<Imagery />} />

        {/* Design Tokens has no landing of its own; its first real page is the architecture. */}
        <Route path="/tokens" element={<TokensLanding />} />
        <Route path="/tokens/architecture" element={<TokenArchitecture />} />
        <Route path="/tokens/primitives" element={<Primitives />} />
        <Route path="/tokens/brand" element={<BrandTokens />} />
        <Route path="/tokens/semantic" element={<SemanticTokens />} />
        <Route path="/tokens/responsive" element={<ResponsiveTokens />} />
        <Route path="/tokens/component" element={<ComponentTokens />} />
        <Route path="/tokens/naming" element={<NamingConventions />} />
        <Route path="/tokens/figma-variables" element={<FigmaVariables />} />
        <Route path="/tokens/dtcg" element={<DTCG />} />
        <Route path="/tokens/style-dictionary" element={<StyleDictionary />} />
        <Route path="/tokens/css" element={<CssTokens />} />
        <Route path="/tokens/typescript" element={<TypeScriptTokens />} />
        <Route path="/tokens/pipeline" element={<TokenPipeline />} />
        <Route path="/tokens/using-tokens" element={<UsingTokens />} />
        <Route path="/tokens/reference" element={<TokenReference />} />

        <Route path="/theming" element={<Theming />} />
        <Route path="/theming/contract" element={<ThemingContract />} />
        <Route path="/theming/authoring" element={<ThemingAuthoring />} />
        <Route path="/theming/applying" element={<ThemingApplying />} />
        <Route path="/theming/validation" element={<ThemingValidation />} />
        <Route path="/theming/designing" element={<ThemingDesigning />} />

        <Route path="/components" element={<ComponentsOverview />} />
        <Route path="/components/category/:cat" element={<ComponentCategory />} />
        <Route path="/components/anatomy" element={<ComponentAnatomy />} />
        <Route path="/components/variants-and-states" element={<VariantsAndStates />} />
        <Route path="/components/responsive" element={<ComponentResponsive />} />
        <Route path="/components/accessibility" element={<ComponentAccessibility />} />
        <Route path="/components/usage" element={<UsageGuidelines />} />
        <Route path="/components/:name" element={<ComponentRoute />} />
        {/* The component page's tab lives in the URL. Static segments outrank this, so
            /components/category/:cat and the guide routes above still win. */}
        <Route path="/components/:name/:tab" element={<ComponentRoute />} />

        <Route path="/patterns" element={<PatternsLanding />} />
        <Route path="/patterns/navigation" element={<NavigationPattern />} />
        <Route path="/patterns/forms" element={<FormsPattern />} />
        <Route path="/patterns/selection" element={<Selection />} />
        <Route path="/patterns/filtering" element={<FilteringPattern />} />
        <Route path="/patterns/search" element={<SearchPattern />} />
        <Route path="/patterns/empty-states" element={<EmptyStates />} />
        <Route path="/patterns/loading" element={<LoadingPattern />} />
        <Route path="/patterns/errors" element={<ErrorsPattern />} />
        <Route path="/patterns/confirmation" element={<ConfirmationPattern />} />
        <Route path="/patterns/progressive-disclosure" element={<ProgressiveDisclosure />} />
        <Route path="/patterns/responsive" element={<ResponsivePatterns />} />
        <Route path="/patterns/workflows" element={<ComplexWorkflows />} />

        <Route path="/accessibility" element={<AccessibilityLanding />} />
        <Route path="/accessibility/principles" element={<A11yPrinciples />} />
        <Route path="/accessibility/wcag" element={<Wcag />} />
        <Route path="/accessibility/contrast" element={<Contrast />} />
        <Route path="/accessibility/keyboard" element={<KeyboardNavigation />} />
        <Route path="/accessibility/focus" element={<FocusManagement />} />
        <Route path="/accessibility/screen-readers" element={<ScreenReaders />} />
        <Route path="/accessibility/semantics" element={<SemanticStructure />} />
        <Route path="/accessibility/forms" element={<AccessibleForms />} />
        <Route path="/accessibility/motion" element={<A11yMotion />} />
        <Route path="/accessibility/testing" element={<A11yTesting />} />

        <Route path="/content" element={<ContentLanding />} />
        <Route path="/content/voice-and-tone" element={<VoiceAndTone />} />
        <Route path="/content/principles" element={<WritingPrinciples />} />
        <Route path="/content/ui-copy" element={<UiCopy />} />
        <Route path="/content/labels" element={<Labels />} />
        <Route path="/content/actions" element={<ActionsCopy />} />
        <Route path="/content/forms" element={<FormsCopy />} />
        <Route path="/content/errors" element={<ErrorsCopy />} />
        <Route path="/content/empty-states" element={<EmptyStatesCopy />} />
        <Route path="/content/notifications" element={<NotificationsCopy />} />
        <Route path="/content/terminology" element={<Terminology />} />
        <Route path="/content/inclusive-language" element={<InclusiveLanguage />} />

        <Route path="/governance" element={<GovernanceLanding />} />
        <Route path="/governance/maintenance" element={<Maintenance />} />
        <Route path="/governance/ownership" element={<Ownership />} />
        <Route path="/governance/contribution" element={<ContributionModel />} />
        <Route path="/governance/requesting-a-component" element={<RequestingAComponent />} />
        <Route path="/governance/proposing-a-change" element={<ProposingAChange />} />
        <Route path="/governance/design-review" element={<DesignReview />} />
        <Route path="/governance/engineering-review" element={<EngineeringReview />} />
        <Route path="/governance/accessibility-review" element={<AccessibilityReview />} />
        <Route path="/governance/lifecycle" element={<Lifecycle />} />
        <Route path="/governance/versioning" element={<Versioning />} />
        <Route path="/governance/deprecation" element={<Deprecation />} />
        <Route path="/governance/releases" element={<Releases />} />
        <Route path="/governance/adoption" element={<Adoption />} />
        <Route path="/governance/roadmap" element={<Roadmap />} />

        <Route path="/tools" element={<ResourcesLanding />} />
        <Route path="/tools/figma" element={<FigmaResource />} />
        <Route path="/tools/storybook" element={<StorybookResource />} />
        <Route path="/tools/tokens" element={<TokensResource />} />
        <Route path="/tools/packages" element={<PackagesResource />} />
        <Route path="/tools/icons" element={<IconsResource />} />
        <Route path="/tools/templates" element={<TemplatesResource />} />
        <Route path="/tools/releases" element={<ReleasesResource />} />
        <Route path="/tools/changelog" element={<ChangelogResource />} />
        <Route path="/tools/support" element={<SupportResource />} />

        <Route path="*" element={<Pending />} />
      </Routes>
    </Shell>
  );
}
