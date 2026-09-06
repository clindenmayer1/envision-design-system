import { Callout, DoDont, DocCard, DocGrid, LivePreview, SectionIntro } from '../modules';
import { ScrollTable, TABLE_CELL } from '../modules/scales';
import { DesignCenterRail, ProductExample } from '../modules/product';
import { DocArticle, SectionLanding } from '../templates';
import { CONTENT_ORDER, sectionNav } from './sections';

const { seq, trail } = sectionNav(CONTENT_ORDER, 'Content', '/content');

/** Do/don't copy pairs render identically everywhere, so the comparison is the only variable. */
function CopyPair({ rows }: { rows: Array<[string, string, string]> }) {
  return (
    <ScrollTable head={['Weak', 'Better', 'Why']}>
      {rows.map((r) => (
        <tr key={r[0]}>
          <td style={{ ...TABLE_CELL, color: 'var(--dc-tone-dont)' }}>{r[0]}</td>
          <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[1]}</td>
          <td style={TABLE_CELL}>{r[2]}</td>
        </tr>
      ))}
    </ScrollTable>
  );
}

/* ------------------------------------------------------------------ landing */

export function ContentLanding() {
  return (
    <SectionLanding
      trail={[{ label: 'Envision Design System', to: '/' }, { label: 'Content' }]}
      title="Content"
      lead="Content is part of the interface. Consistent terminology, labels, instructions, and feedback help people understand what Envision is asking them to do and what will happen next."
      related={[
        { title: 'Components', to: '/components', note: 'Where the words live.' },
        { title: 'Patterns', to: '/patterns', note: 'Content is part of every pattern.' },
        { title: 'Accessibility', to: '/accessibility', note: 'Clear language is an accessibility requirement.' },
      ]}
      next={{ title: 'Voice & tone', to: '/content/voice-and-tone' }}
      intro={
        <SectionIntro
          heading="The words are the interface"
          body="A person does not experience a component; they experience what it says. A label that names the outcome, a cost written as a delta, an error that says how to recover: these are design decisions, and they belong to the system."
          cta={{ label: 'Start with voice & tone', to: '/content/voice-and-tone' }}
          visual={<DesignCenterRail />}
        />
      }
      grid={
        <DocGrid columns={4}>
          <DocCard to="/content/voice-and-tone" title="Voice &amp; tone">How Envision sounds, and when that changes.</DocCard>
          <DocCard to="/content/principles" title="Writing principles">Seven rules, each with a reason.</DocCard>
          <DocCard to="/content/ui-copy" title="UI copy">Writing for scanning rather than reading.</DocCard>
          <DocCard to="/content/labels" title="Labels">Naming fields, options and destinations.</DocCard>
          <DocCard to="/content/actions" title="Buttons &amp; actions">Verb-first labels that predict the outcome.</DocCard>
          <DocCard to="/content/forms" title="Forms">Labels, helper text and instructions.</DocCard>
          <DocCard to="/content/errors" title="Validation &amp; errors">What happened, what needs attention, how to fix it.</DocCard>
          <DocCard to="/content/terminology" title="Terminology">The Envision product glossary.</DocCard>
        </DocGrid>
      }
    />
  );
}

/* ------------------------------------------------------------- voice & tone */

export function VoiceAndTone() {
  return (
    <DocArticle
      trail={trail('Voice & tone')}
      title="Voice &amp; tone"
      lead="Envision's voice is constant. Its tone changes with what is happening. Someone comparing finishes and someone whose submission just failed need the same personality and very different registers."
      toc={[
        { id: 'difference', label: 'Voice versus tone' },
        { id: 'voice', label: 'The Envision voice' },
        { id: 'tone', label: 'Tone by context' },
        { id: 'avoid', label: 'What to avoid' },
      ]}
      related={[
        { title: 'Writing principles', to: '/content/principles', note: 'The rules that follow from this.' },
        { title: 'Validation & errors', to: '/content/errors', note: 'Tone under pressure.' },
        { title: 'Terminology', to: '/content/terminology', note: 'The words themselves.' },
      ]}
      {...seq('/content/voice-and-tone')}
    >
      <h2 className="dc-h2" id="difference">Voice versus tone</h2>
      <p>
        Voice is who Envision is and does not change. Tone is how that voice adapts to the moment. The same person is
        recognizable whether they are explaining something or apologizing, and so is a product.
      </p>

      <h2 className="dc-h2" id="voice">The Envision voice</h2>
      <p>
        Derived from what the product actually does. Someone is making expensive, permanent decisions about their home,
        often for the first time, and frequently unsure. That produces four characteristics.
      </p>
      <ScrollTable head={['Characteristic', 'Means', 'Because']}>
        {[
          ['Clear', 'Plain words, one idea per sentence', 'People are deciding, not reading'],
          ['Direct', 'Say what happens, not what might', 'Ambiguity about cost or permanence is expensive'],
          ['Calm', 'No urgency that is not real', 'The stakes are already high enough'],
          ['Useful', 'Every sentence helps a decision', 'Filler competes with the material being judged'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        Notice what is absent: not playful, not enthusiastic, not reassuring. A configurator that is cheerful about a
        four-thousand-dollar upgrade reads as a sales tactic.
      </p>

      <h2 className="dc-h2" id="tone">Tone by context</h2>
      <ScrollTable head={['Context', 'Tone', 'Example']}>
        {[
          ['Routine selection', 'Neutral, almost invisible', 'Matte Walnut · +$120'],
          ['Confirmation', 'Factual', 'Selections applied.'],
          ['Cost increase', 'Plain, never apologetic or celebratory', 'Upgrades +$4,280'],
          ['Warning', 'Direct about the consequence', 'This finish is unavailable in your region.'],
          ['Error', 'Specific and actionable, never sorry', 'Enter a valid email address.'],
          ['Empty, first use', 'Briefly inviting', 'No selections yet. Choose a package to get started.'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="avoid">What Envision avoids</h2>
      <CopyPair
        rows={[
          ['Discover our stunning finishes!', 'Cabinet finish', 'Promotional language in functional UI. The person is already here.'],
          ['Oops! Something went wrong.', 'Selections could not be saved. Try again.', '“Oops” is cheerful about a failure and says nothing about what failed.'],
          ['You’re doing great!', '4 of 6 rooms configured', 'Vague encouragement. The fact is more useful and more respectful.'],
          ['Nice choice!', 'Matte Walnut · +$120', 'Praising a decision that costs money reads as a sales tactic.'],
        ]}
      />
    </DocArticle>
  );
}

/* ---------------------------------------------------------------- principles */

const WRITING_PRINCIPLES = [
  {
    rule: 'Lead with what matters',
    why: 'People scan interfaces; they read the first few words of anything and skip the rest. Put the decision-relevant word first.',
    do: '“Matte Walnut · +$120”',
    dont: '“This beautiful option is called Matte Walnut and costs $120 more”',
  },
  {
    rule: 'Write for action',
    why: 'Interface copy exists to help someone do something. A label that names the outcome lets them predict what happens before committing.',
    do: '“Apply design”',
    dont: '“Submit”',
  },
  {
    rule: 'Use plain language',
    why: 'The audience is homebuyers, not builders. A term the industry uses daily may be meaningless to the person paying for it.',
    do: '“Cabinet finish”',
    dont: '“Casework surface treatment”',
  },
  {
    rule: 'Keep terminology consistent',
    why: 'The same concept must have exactly one name. Two names for one thing makes people wonder what the difference is.',
    do: 'Always “selection”',
    dont: 'Mixing “selection”, “choice” and “option” for the same concept',
  },
  {
    rule: 'Remove words that do no work',
    why: 'Every removable word costs attention someone needs for the material they are comparing.',
    do: '“Enter a valid email address.”',
    dont: '“Please make sure that you have entered a valid email address.”',
  },
  {
    rule: 'Make outcomes predictable',
    why: 'Nobody should discover what a control does by pressing it. This matters more when the action has a price.',
    do: '“Apply design” next to a visible total',
    dont: '“Continue”, which does not say what is being committed',
  },
  {
    rule: 'Write for scanning',
    why: 'Front-load the distinguishing word. In a list of six finishes, the word that differs should not be in position four.',
    do: '“Matte Walnut”, “Satin Walnut”',
    dont: '“Walnut, matte finish”, “Walnut, satin finish”',
  },
];

export function WritingPrinciples() {
  return (
    <DocArticle
      trail={trail('Writing principles')}
      title="Writing principles"
      lead="Seven rules, each with a reason grounded in what Envision's users are actually doing when they read."
      toc={WRITING_PRINCIPLES.map((p, i) => ({ id: `w${i}`, label: p.rule }))}
      related={[
        { title: 'Voice & tone', to: '/content/voice-and-tone', note: 'The personality behind the rules.' },
        { title: 'UI copy', to: '/content/ui-copy', note: 'Applying them in components.' },
        { title: 'Terminology', to: '/content/terminology', note: 'Consistency in practice.' },
      ]}
      {...seq('/content/principles')}
    >
      {WRITING_PRINCIPLES.map((p, i) => (
        <section key={p.rule}>
          <h2 className="dc-h2" id={`w${i}`}>{p.rule}</h2>
          <p>{p.why}</p>
          <DoDont items={[{ kind: 'do', text: p.do }, { kind: 'dont', text: p.dont }]} />
        </section>
      ))}
    </DocArticle>
  );
}

/* ------------------------------------------------------------------- ui copy */

export function UiCopy() {
  return (
    <DocArticle
      trail={trail('UI copy')}
      title="UI copy"
      lead="Interface copy is read in fragments, under time pressure, next to something the person is actually looking at. Writing for that is different from writing prose."
      toc={[
        { id: 'scanning', label: 'Writing for scanning' },
        { id: 'brevity', label: 'Brevity versus completeness' },
        { id: 'places', label: 'Copy by place' },
        { id: 'product', label: 'In the product' },
      ]}
      related={[
        { title: 'Labels', to: '/content/labels', note: 'Naming things.' },
        { title: 'Buttons & actions', to: '/content/actions', note: 'Naming actions.' },
        { title: 'Typography', to: '/foundations/typography', note: 'How the words are set.' },
      ]}
      {...seq('/content/ui-copy')}
    >
      <h2 className="dc-h2" id="scanning">Writing for scanning</h2>
      <p>
        People read the first two or three words of an interface element and move on. Everything after that is a bonus,
        so the distinguishing information belongs at the front.
      </p>
      <p>
        In a list this compounds: six finishes all beginning “Walnut, …” force reading to the end of every line to tell
        them apart.
      </p>

      <h2 className="dc-h2" id="brevity">Brevity versus completeness</h2>
      <p>
        Short is not the goal; unambiguous is. “Continue” is shorter than “Apply design” and worse, because it does not
        say what continues.
      </p>
      <p>
        The test is whether removing a word loses information a person needs at that moment. If not, remove it. If yes,
        it stays regardless of length.
      </p>

      <h2 className="dc-h2" id="places">Copy by place</h2>
      <ScrollTable head={['Place', 'Job', 'Length']}>
        {[
          ['Heading', 'Name what this region contains', '1 to 4 words'],
          ['Option label', 'Distinguish this option from its neighbours', '2 to 5 words, distinguishing word first'],
          ['Helper text', 'Prevent an error before it happens', 'One sentence'],
          ['Error', 'What happened and how to fix it', 'One sentence'],
          ['Action', 'Name the outcome', '1 to 3 words, verb first'],
          ['Status', 'State a fact', 'A fragment, not a sentence'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="product">In the product</h2>
      <ProductExample
        title="Design Center · every content decision on one surface"
        surface={<DesignCenterRail />}
        annotations={[
          'Row labels name the decision, not the action: “Cabinet Finish”, not “Choose finish”.',
          'Costs are deltas from the included baseline, never absolute prices.',
          '“Included” rather than “$0”, because it is part of what was already bought.',
          'The commit action names the outcome: “Apply design”.',
        ]}
      />
    </DocArticle>
  );
}

/* -------------------------------------------------------------------- labels */

export function Labels() {
  return (
    <DocArticle
      trail={trail('Labels')}
      title="Labels"
      lead="A label names a thing. Getting it wrong does not just look untidy: it makes people choose the wrong option, or fail to find one that is right there."
      toc={[
        { id: 'field', label: 'Field labels' },
        { id: 'option', label: 'Option labels' },
        { id: 'navigation', label: 'Navigation labels' },
        { id: 'headings', label: 'Section headings' },
        { id: 'capitalization', label: 'Capitalization' },
        { id: 'units', label: 'Units and numbers' },
        { id: 'ambiguity', label: 'Avoiding ambiguity' },
        { id: 'a11y', label: 'Accessibility' },
      ]}
      related={[
        { title: 'Accessible forms', to: '/accessibility/forms', note: 'Association requirements.' },
        { title: 'Terminology', to: '/content/terminology', note: 'The approved vocabulary.' },
        { title: 'Forms', to: '/content/forms', note: 'Labels in context.' },
      ]}
      {...seq('/content/labels')}
    >
      <h2 className="dc-h2" id="field">Field labels</h2>
      <p>
        Name what is being asked for, not what to do. “Project name” rather than “Enter project name”. Labels are
        always visible; a placeholder is not a label.
      </p>

      <h2 className="dc-h2" id="option">Option labels</h2>
      <p>
        Carry material and finish together, because that pairing is what the person is choosing between. “Walnut” alone
        does not distinguish matte from satin, and that difference is the whole decision.
      </p>
      <CopyPair
        rows={[
          ['Walnut', 'Matte Walnut', 'Finish is part of the choice, not a detail'],
          ['Option 3', 'Flat Panel', 'A number is not a name'],
          ['Walnut (matte)', 'Matte Walnut', 'Front-load the distinguishing word for scanning'],
        ]}
      />

      <h2 className="dc-h2" id="navigation">Navigation labels</h2>
      <p>
        Name the destination, not the journey. “Packages”, not “View packages”. Keep them identical everywhere the
        destination is referenced; a name that changes by context is unlearnable.
      </p>

      <h2 className="dc-h2" id="headings">Section headings</h2>
      <p>
        Say what the section contains so someone can decide whether to read it. Headings are also the document outline
        that screen reader users navigate by, so vague headings cost more than clarity.
      </p>

      <h2 className="dc-h2" id="capitalization">Capitalization</h2>
      <p>
        Sentence case everywhere, except product names that are legitimately proper nouns: Design Center, Matte Walnut.
        Sentence case is faster to read and makes proper nouns actually stand out.
      </p>

      <h2 className="dc-h2" id="units">Units and numbers</h2>
      <p>
        Always state the unit. Costs are deltas with an explicit sign: <code>+$120</code>. Where numbers stack for
        comparison they are set with tabular figures so digits align.
      </p>
      <p>
        The baseline option is <code>Included</code>, not <code>$0</code>: it is part of what was already purchased,
        and pricing it at zero invites the reading that it is lesser.
      </p>

      <h2 className="dc-h2" id="ambiguity">Avoiding ambiguity</h2>
      <p>
        A label read alone must mean one thing. “Finish” could be a noun or a verb; “Cabinet finish” cannot. Ambiguity
        is cheapest to fix at the label and most expensive to fix in support.
      </p>

      <h2 className="dc-h2" id="a11y">Accessibility</h2>
      <p>
        The visible label is usually the accessible name, which is why label quality is an accessibility concern and
        not only a stylistic one. Icon-only controls have no visible text, so the name must be supplied explicitly and
        must describe the action rather than the picture.
      </p>
    </DocArticle>
  );
}

/* ------------------------------------------------------------------- actions */

export function ActionsCopy() {
  return (
    <DocArticle
      trail={trail('Buttons & actions')}
      title="Buttons &amp; actions"
      lead="An action label is a promise about what happens next. In a product where actions change what someone is buying, vague promises are expensive."
      toc={[
        { id: 'verb', label: 'Verb first' },
        { id: 'outcome', label: 'Name the outcome' },
        { id: 'pairs', label: 'Common pairs' },
        { id: 'destructive', label: 'Destructive actions' },
        { id: 'cancel', label: 'Cancel and back' },
        { id: 'button-link', label: 'Button or link' },
        { id: 'generic', label: 'Generic labels' },
      ]}
      related={[
        { title: 'Button', to: '/components/button', note: 'The component.' },
        { title: 'Confirmation', to: '/patterns/confirmation', note: 'Where labels matter most.' },
        { title: 'Semantic structure', to: '/accessibility/semantics', note: 'Button versus link semantics.' },
      ]}
      {...seq('/content/actions')}
    >
      <h2 className="dc-h2" id="verb">Verb first</h2>
      <p>
        Start with the verb, so the first word already says what will happen. “Apply design”, “Save selections”,
        “Delete room”.
      </p>
      <LivePreview caption="Real Buttons. Each label names the outcome rather than the mechanism.">
        <envision-button variant="primary" label="Apply design" />
        <envision-button variant="outline" label="Explore components" />
        <envision-button variant="ghost" label="Cancel" />
      </LivePreview>

      <h2 className="dc-h2" id="outcome">Name the outcome, not the mechanism</h2>
      <p>
        “Submit” describes what the form does. “Apply design” describes what the person gets. Nobody wants to submit
        anything; they want their kitchen to look like the thing they just configured.
      </p>

      <h2 className="dc-h2" id="pairs">Common pairs</h2>
      <CopyPair
        rows={[
          ['Submit', 'Apply design', 'Names the outcome, not the form mechanic'],
          ['OK', 'Delete selections', 'A confirming button must survive being read alone'],
          ['Click here', 'View package details', 'Says nothing, and is unusable out of context'],
          ['Continue', 'Review selections', 'Continue to what? Especially bad before a commit'],
          ['Done', 'Save and close', 'Says the person is finished, not what happened'],
        ]}
      />

      <h2 className="dc-h2" id="destructive">Destructive actions</h2>
      <p>
        Name what is being destroyed. “Delete” is ambiguous in a screen with several things; “Delete room” is not. In a
        confirmation, the confirming button carries the verb so someone reading only the buttons still knows which is
        which.
      </p>

      <h2 className="dc-h2" id="cancel">Cancel and back</h2>
      <p>
        “Cancel” abandons; “Back” returns without abandoning. They are not interchangeable, and using the wrong one
        makes people afraid to press either.
      </p>

      <h2 className="dc-h2" id="button-link">Button or link</h2>
      <p>
        A button performs an action; a link goes somewhere. This is a semantic decision before a visual one: a link
        can be opened in a new tab and announces itself differently. Style a link as a button freely; do not make a
        button navigate.
      </p>

      <h2 className="dc-h2" id="generic">Generic labels</h2>
      <p>
        Every generic label is a missed opportunity to tell someone what will happen. They also fail hardest for screen
        reader users, who may hear the label with no surrounding context at all.
      </p>
      <Callout type="Note" title="Use the product's own words">
        Where the product already has established vocabulary, use it. Consistency with what people already see beats
        an abstractly better verb.
      </Callout>
    </DocArticle>
  );
}

/* --------------------------------------------------------------- forms copy */

export function FormsCopy() {
  return (
    <DocArticle
      trail={trail('Forms')}
      title="Content for forms"
      lead="Forms ask people for things. Every word either reduces the effort of answering or adds to it."
      toc={[
        { id: 'labels', label: 'Labels' },
        { id: 'helper', label: 'Helper text' },
        { id: 'placeholder', label: 'Placeholder text' },
        { id: 'required', label: 'Optional and required' },
        { id: 'instructions', label: 'Instructions' },
        { id: 'units', label: 'Units and examples' },
        { id: 'choices', label: 'Choice labels' },
        { id: 'submit', label: 'Submit actions' },
      ]}
      related={[
        { title: 'Forms pattern', to: '/patterns/forms', note: 'Structure and validation timing.' },
        { title: 'Accessible forms', to: '/accessibility/forms', note: 'Association requirements.' },
        { title: 'Validation & errors', to: '/content/errors', note: 'When something goes wrong.' },
      ]}
      {...seq('/content/forms')}
    >
      <h2 className="dc-h2" id="labels">Labels</h2>
      <p>Name the information, not the instruction. “Email”, not “Enter your email”. Keep them short enough to scan.</p>

      <h2 className="dc-h2" id="helper">Helper text</h2>
      <p>
        Helper text prevents an error. If it is only useful after something goes wrong, it is an error message in the
        wrong place. One sentence, stating the constraint plainly.
      </p>
      <LivePreview caption="Real Field with helper text. It explains before the person can get it wrong.">
        <div style={{ width: 320 }}>
          <envision-input label="Email" type="email" helper-text="We'll only use this to send your selections." />
        </div>
      </LivePreview>

      <h2 className="dc-h2" id="placeholder">Placeholder text</h2>
      <p>
        A placeholder shows the shape of an answer, never the label. It disappears exactly when someone needs it, is
        often too low-contrast, and is announced inconsistently. Use it for an example format, or not at all.
      </p>

      <h2 className="dc-h2" id="required">Optional and required</h2>
      <p>
        Mark whichever is rarer. If most fields are required, mark the optional ones with “(optional)”. Marking every
        field with an asterisk communicates nothing.
      </p>

      <h2 className="dc-h2" id="instructions">Instructions</h2>
      <p>
        Put instructions before the fields they govern, not after. A note underneath a field about how to fill it in
        arrives too late to be read.
      </p>

      <h2 className="dc-h2" id="units">Units and examples</h2>
      <p>
        State the unit in the label or helper text rather than expecting someone to infer it. Where a format is
        unusual, show one example: “e.g. matte walnut” does more than a paragraph of description.
      </p>

      <h2 className="dc-h2" id="choices">Choice labels</h2>
      <p>
        Options in a group must be parallel: all nouns or all verbs, all the same grammatical shape. Mixed shapes make
        a set look like it contains different kinds of thing.
      </p>

      <h2 className="dc-h2" id="submit">Submit actions</h2>
      <p>
        Name what the submission achieves. “Save selections” beats “Submit”, and during submission the label states
        what is happening: “Saving…”.
      </p>
    </DocArticle>
  );
}

/* -------------------------------------------------------------------- errors */

export function ErrorsCopy() {
  return (
    <DocArticle
      trail={trail('Validation & errors')}
      title="Validation &amp; errors"
      lead="An error message has one job: get the person unstuck. Every word that does not serve that is in the way."
      toc={[
        { id: 'model', label: 'The three-part model' },
        { id: 'field', label: 'Field errors' },
        { id: 'form', label: 'Form errors' },
        { id: 'page', label: 'Page and system errors' },
        { id: 'blame', label: 'Never assign blame' },
        { id: 'examples', label: 'Weak and strong' },
      ]}
      related={[
        { title: 'Errors pattern', to: '/patterns/errors', note: 'Where errors appear.' },
        { title: 'Accessible forms', to: '/accessibility/forms', note: 'Association and announcement.' },
        { title: 'Voice & tone', to: '/content/voice-and-tone', note: 'Tone under pressure.' },
      ]}
      {...seq('/content/errors')}
    >
      <h2 className="dc-h2" id="model">The three-part model</h2>
      <p>Every error answers three questions. Short messages answer all three at once.</p>
      <ScrollTable head={['Part', 'Answers', 'Example']}>
        {[
          ['What happened', 'What went wrong?', 'Selections could not be saved'],
          ['What needs attention', 'Where is the problem?', 'Two rooms have unavailable finishes'],
          ['How to fix it', 'What do I do now?', 'Choose a different finish, or try again'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>“Enter a valid email address” does all three in five words: the value is wrong, this field, enter a valid one.</p>

      <h2 className="dc-h2" id="field">Field errors</h2>
      <p>
        Say what is expected, not what is wrong. “Enter a valid email address” tells someone what to do; “Invalid
        input” tells them only that they failed.
      </p>
      <LivePreview caption="Real Field. The message replaces helper text and is associated with the input.">
        <div style={{ width: 320 }}>
          <envision-input label="Email" type="email" value="not-an-email" invalid error-message="Enter a valid email address." />
        </div>
      </LivePreview>

      <h2 className="dc-h2" id="form">Form errors</h2>
      <p>
        Say how many fields need attention and let the inline errors say which. A summary never replaces inline
        errors, and focus should move to the first invalid field.
      </p>

      <h2 className="dc-h2" id="page">Page and system errors</h2>
      <p>
        Say what failed and whether the person can do anything. If they cannot, say that plainly rather than offering a
        retry that cannot succeed. Never imply their work is lost unless it is.
      </p>

      <h2 className="dc-h2" id="blame">Never assign blame</h2>
      <p>
        Not “You entered an invalid email” but “Enter a valid email address”. Not because blame is impolite, but
        because the second sentence contains the instruction and the first does not.
      </p>
      <p>Equally, do not apologize. “Sorry” takes space that the recovery path needs.</p>

      <h2 className="dc-h2" id="examples">Weak and strong</h2>
      <CopyPair
        rows={[
          ['Invalid input', 'Enter a valid email address.', 'Says what is expected rather than that something failed'],
          ['Oops! Something went wrong.', 'Selections could not be saved. Try again.', 'Names what failed and what to do'],
          ['Error 422', 'This finish is unavailable in your region. Choose another.', 'A code is not a message'],
          ['Please try again later.', 'Saving is unavailable right now. Your selections are still here.', 'Reassures about the thing people actually fear'],
        ]}
      />
    </DocArticle>
  );
}

/* -------------------------------------------------------------- empty states */

export function EmptyStatesCopy() {
  return (
    <DocArticle
      trail={trail('Empty states')}
      title="Content for empty states"
      lead="Six reasons nothing is here, six different things to say. Using one message for all of them is how “no results” ends up greeting a brand-new project."
      toc={[
        { id: 'formula', label: 'The formula' },
        { id: 'templates', label: 'Templates by type' },
        { id: 'tone', label: 'Tone' },
      ]}
      related={[
        { title: 'Empty states pattern', to: '/patterns/empty-states', note: 'When each appears.' },
        { title: 'Voice & tone', to: '/content/voice-and-tone', note: 'Register per context.' },
        { title: 'Filtering', to: '/patterns/filtering', note: 'The most misread empty state.' },
      ]}
      {...seq('/content/empty-states')}
    >
      <h2 className="dc-h2" id="formula">The formula</h2>
      <p>
        A headline stating the situation, one line of supporting copy, and at most one action. If the supporting line
        is not saying something the headline cannot, cut it.
      </p>

      <h2 className="dc-h2" id="templates">Templates by type</h2>
      <ScrollTable head={['Type', 'Headline', 'Supporting', 'Action']}>
        {[
          ['First use', 'No selections yet', 'Choose a package to get started.', 'Browse packages'],
          ['No data', 'No upgrades available for this room', 'Everything here is included.', 'None'],
          ['No search results', 'No finishes match “walnutt”', 'Check the spelling, or browse all finishes.', 'Clear search'],
          ['No filtered results', 'No finishes match these filters', '2 filters applied.', 'Clear filters'],
          ['Cleared', 'No selections', 'None', 'Undo'],
          ['Error', 'Selections could not be loaded', 'Your saved selections are safe.', 'Try again'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
            <td style={TABLE_CELL}>{r[3]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        Two patterns worth noticing. Search echoes the query, because people cannot see their own typo. The error state
        reassures that saved work is safe, because that is the thing someone actually fears when a screen is empty.
      </p>

      <h2 className="dc-h2" id="tone">Tone</h2>
      <p>
        First use is the only one that is an opportunity; do not apologize there. Cleared states should stay quiet: the
        person did it on purpose and does not need an explanation of their own action.
      </p>
      <DoDont
        items={[
          { kind: 'do', text: 'Say which filters are active when a filter empties a list, so the empty result is legible as a filter and not a fault.' },
          { kind: 'dont', text: 'Show “No results” with no explanation. People read that as the product being broken or their data being gone.' },
        ]}
      />
    </DocArticle>
  );
}

/* ------------------------------------------------------------- notifications */

export function NotificationsCopy() {
  return (
    <DocArticle
      trail={trail('Notifications')}
      title="Notifications"
      lead="Guidance for writing status messages. Envision has no notification component, so this page is about the words rather than a specification for something that does not exist."
      toc={[
        { id: 'status', label: 'Component status' },
        { id: 'four', label: 'Four kinds' },
        { id: 'structure', label: 'Structure' },
        { id: 'persistence', label: 'Persistence and dismissal' },
        { id: 'urgency', label: 'Urgency' },
      ]}
      related={[
        { title: 'Errors pattern', to: '/patterns/errors', note: 'Where errors belong.' },
        { title: 'Confirmation', to: '/patterns/confirmation', note: 'Success without interruption.' },
        { title: 'Badge', to: '/components/badge', note: 'The count indicator that does exist.' },
      ]}
      {...seq('/content/notifications')}
    >
      <h2 className="dc-h2" id="status">Component status</h2>
      <Callout type="Important" title="There is no notification or toast component">
        The registry contains Badge and Notification Badge for counts, and Notification Bell as an action, but no
        notification, toast or banner component. This page is content guidance for status messages wherever they
        appear; it does not specify a component that has not been built.
      </Callout>

      <h2 className="dc-h2" id="four">Four kinds</h2>
      <ScrollTable head={['Kind', 'Says', 'Example', 'Needs an action?']}>
        {[
          ['Success', 'Something worked', 'Selections applied.', 'Rarely'],
          ['Information', 'Something you should know', 'This package includes 12 selections.', 'Sometimes'],
          ['Warning', 'Something will be a problem', 'This finish is unavailable in your region.', 'Usually'],
          ['Error', 'Something failed', 'Selections could not be saved.', 'Always'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
            <td style={TABLE_CELL}>{r[3]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        Success messages are the most over-used. If the result is visible, the message is noise: when a finish changes
        and the visualization updates, saying “Finish updated” adds nothing.
      </p>

      <h2 className="dc-h2" id="structure">Structure</h2>
      <p>
        Lead with what happened. A heading only when the message is long enough to need one; most status messages are
        a single sentence and a heading just doubles the words.
      </p>

      <h2 className="dc-h2" id="persistence">Persistence and dismissal</h2>
      <p>
        Transient for success, persistent for anything requiring action. An error that disappears on a timer is an
        error someone will never resolve. Anything that persists must be dismissible.
      </p>

      <h2 className="dc-h2" id="urgency">Urgency</h2>
      <p>
        Reserve interruption for things that genuinely cannot wait. Urgency used for routine events teaches people to
        ignore it, and then the one that mattered is ignored too.
      </p>
    </DocArticle>
  );
}

/* --------------------------------------------------------------- terminology */

const GLOSSARY: Array<[string, string, string, string]> = [
  ['Design Center', 'The configurator where someone makes and reviews selections for their home.', 'Configurator, design tool', 'Continue to Design Center'],
  ['Selection', 'A decision someone has made about their home, such as a finish or a fixture.', 'Choice, pick', 'Review selections'],
  ['Package', 'A curated set of selections chosen together as one decision.', 'Bundle, collection', 'Heritage Package'],
  ['Option', 'One of the available answers to a single decision.', '', 'Cabinet Style has four options'],
  ['Material', 'The physical substance of an option: wood, stone, tile.', '', 'Matte Walnut'],
  ['Finish', 'The surface treatment of a material.', '', 'Matte, Satin, Natural'],
  ['Included', 'Part of the base purchase, at no additional cost.', 'Free, $0, Standard', 'White Oak · Included'],
  ['Upgrade', 'A selection that costs more than the included option.', 'Add-on, extra', 'Upgrades +$4,280'],
  ['Cabinet', 'Kitchen and bath casework.', 'Casework, millwork', 'Cabinet Finish'],
  ['Countertop', 'The work surface above cabinets.', 'Counter, worktop', 'Countertop +$1,200'],
  ['Backsplash', 'The wall surface between countertop and upper cabinets.', 'Splashback', ''],
  ['Flooring', 'The floor surface of a room.', 'Floor covering', ''],
  ['Hardware', 'Pulls, knobs and handles on cabinetry.', 'Fixtures', 'Hardware +$85'],
  ['Lighting', 'Light fixtures selected for a room.', '', ''],
  ['Room', 'A space being configured, such as Kitchen.', '', 'Kitchen'],
  ['Plan', 'The house model being configured.', 'Model, floorplan', 'Westlake, The Sonoma'],
];

export function Terminology() {
  return (
    <DocArticle
      trail={trail('Terminology')}
      title="Terminology"
      lead="The Envision product glossary. One concept, one name, everywhere. Two names for one thing makes people wonder what the difference is."
      toc={[
        { id: 'why', label: 'Why one name' },
        { id: 'glossary', label: 'Glossary' },
        { id: 'adding', label: 'Adding a term' },
      ]}
      related={[
        { title: 'Labels', to: '/content/labels', note: 'Applying the vocabulary.' },
        { title: 'Writing principles', to: '/content/principles', note: 'Consistency as a rule.' },
        { title: 'Selection', to: '/patterns/selection', note: 'The pattern these words describe.' },
      ]}
      {...seq('/content/terminology')}
    >
      <h2 className="dc-h2" id="why">Why one name</h2>
      <p>
        People assume different words mean different things. If one screen says “selection” and another says “choice”,
        someone will reasonably wonder whether they are looking at two concepts.
      </p>
      <p>
        Consistency matters more here than elsewhere, because the vocabulary is domain-specific: a homebuyer is
        learning these words from the product itself.
      </p>

      <h2 className="dc-h2" id="glossary">Glossary</h2>
      <ScrollTable head={['Preferred term', 'Definition', 'Avoid', 'Example']}>
        {GLOSSARY.map(([term, def, avoid, example]) => (
          <tr key={term}>
            <td style={{ ...TABLE_CELL, fontWeight: 600, whiteSpace: 'nowrap' }}>{term}</td>
            <td style={TABLE_CELL}>{def}</td>
            <td style={{ ...TABLE_CELL, color: avoid ? 'var(--dc-tone-dont)' : undefined }}>
              {avoid || <span className="dc-small">None</span>}
            </td>
            <td style={TABLE_CELL}>{example || <span className="dc-small">None</span>}</td>
          </tr>
        ))}
      </ScrollTable>
      <Callout type="Note" title="“Avoid” lists only real alternatives">
        The avoid column names words that plausibly appear in adjacent industry usage and would create ambiguity here.
        Where no genuine competing term exists, the column is empty rather than padded with invented prohibitions.
      </Callout>

      <h2 className="dc-h2" id="adding">Adding a term</h2>
      <p>
        A term belongs here when it appears in the interface, has a specific meaning in Envision, and could reasonably
        be called something else. Terms that are ordinary English used ordinarily do not need an entry.
      </p>
    </DocArticle>
  );
}

/* ----------------------------------------------------------- inclusive language */

export function InclusiveLanguage() {
  return (
    <DocArticle
      trail={trail('Accessibility & inclusive language')}
      title="Accessibility &amp; inclusive language"
      lead="Language is part of accessibility. Instructions that depend on seeing, links that mean nothing alone, and unnecessarily complex sentences all exclude people the interface otherwise supports."
      toc={[
        { id: 'plain', label: 'Plain language' },
        { id: 'links', label: 'Descriptive links' },
        { id: 'non-visual', label: 'Non-visual instructions' },
        { id: 'labels', label: 'Screen-reader-friendly labels' },
        { id: 'idiom', label: 'Idiom and figures of speech' },
        { id: 'respectful', label: 'Respectful language' },
        { id: 'errors', label: 'Error language' },
      ]}
      related={[
        { title: 'Screen readers', to: '/accessibility/screen-readers', note: 'How labels are announced.' },
        { title: 'Labels', to: '/content/labels', note: 'Naming things well.' },
        { title: 'Validation & errors', to: '/content/errors', note: 'Recovery language.' },
      ]}
      {...seq('/content/inclusive-language')}
    >
      <h2 className="dc-h2" id="plain">Plain language</h2>
      <p>
        Plain language helps everyone and is essential for people with cognitive disabilities, people reading in a
        second language, and anyone under stress, which describes most people making a large purchase.
      </p>
      <p>One idea per sentence. Common words over precise-but-rare ones. Active voice.</p>

      <h2 className="dc-h2" id="links">Descriptive links</h2>
      <p>
        Screen reader users often navigate by pulling up a list of links with no surrounding context. A page of “Learn
        more” links is a list of identical entries.
      </p>
      <CopyPair
        rows={[
          ['Learn more', 'View package details', 'Meaningful when read out of context'],
          ['Click here', 'Read the Selection pattern', 'Names the destination'],
          ['Read more about how tokens work here', 'Token architecture', 'The link text is the destination, not a sentence'],
        ]}
      />

      <h2 className="dc-h2" id="non-visual">Non-visual instructions</h2>
      <p>
        Never rely on position, color or shape alone. “Click the green button on the right” fails for anyone who
        cannot see the layout, and breaks the moment the layout reflows on a phone.
      </p>
      <CopyPair
        rows={[
          ['Click the green button on the right', 'Select Apply design', 'Names the control rather than describing its appearance'],
          ['Items marked in red need attention', 'Two fields need attention', 'Does not depend on perceiving color'],
          ['See the table below', 'See the breakpoint reference', 'Position changes with layout; names do not'],
        ]}
      />

      <h2 className="dc-h2" id="labels">Screen-reader-friendly labels</h2>
      <p>
        Every accessible name should make sense read alone. For icon-only controls describe the action, not the glyph:
        “Adjust settings”, not “Tune”.
      </p>

      <h2 className="dc-h2" id="idiom">Idiom and figures of speech</h2>
      <p>
        Idiom is the first thing to fail in translation and for non-native readers. “Get started” is fine and widely
        understood; “hit the ground running” is not worth the risk in an interface.
      </p>

      <h2 className="dc-h2" id="respectful">Respectful language</h2>
      <p>
        Write about people, not about categories. Avoid language that implies a default user. In this product that
        mostly means not assuming who is buying a home, who they live with, or why.
      </p>

      <h2 className="dc-h2" id="errors">Error language</h2>
      <p>
        Errors are read by someone who is already frustrated. Do not blame, do not apologize, do not use jargon or
        codes. Say what happened and what to do, in that order, in as few words as carry the meaning.
      </p>
    </DocArticle>
  );
}
