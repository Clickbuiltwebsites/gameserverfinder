"use client";

import { useActionState, useState } from "react";
import { ImageUpload } from "./image-upload";
import { createListingAction, type ListingFormState } from "@/app/actions";
import {
  GAMES,
  GAME_BLURB,
  GAME_LABEL,
  PLAYSTYLES,
  PLAYSTYLE_HINT,
  PLAYSTYLE_LABEL,
  REGIONS,
  REGION_LONG,
  drugsApplies,
} from "@/lib/taxonomy";
import type { Game } from "@/lib/taxonomy";

const EMPTY: ListingFormState = { errors: {} };

function Help({ error, children }: { error?: string; children?: React.ReactNode }) {
  if (error) {
    return (
      <p className="field__help field__help--error">
        <span aria-hidden="true">⚠</span>
        {error}
      </p>
    );
  }
  return <p className="field__help">{children}</p>;
}

export function ListingForm() {
  const [state, formAction, pending] = useActionState(createListingAction, EMPTY);
  const [game, setGame] = useState<Game>("FIVEM");
  const values = state.values ?? {};
  const errors = state.errors;
  const showDrugs = drugsApplies(game);

  return (
    <form action={formAction} className="form" noValidate>
      {errors.form ? (
        <p className="notice notice--error" role="alert">
          {errors.form}
        </p>
      ) : null}

      <fieldset className="filters__group">
        <legend className="field__label">
          Which game?<span className="field__req">*</span>
        </legend>
        <div className="picker" style={{ marginBlockStart: "var(--space-xs)" }}>
          {GAMES.map((option) => (
            <label className="picker__option" key={option}>
              <input
                type="radio"
                name="game"
                value={option}
                checked={game === option}
                onChange={() => setGame(option)}
              />
              <span className="picker__title">{GAME_LABEL[option]}</span>
              <span className="picker__hint">{GAME_BLURB[option]}</span>
            </label>
          ))}
        </div>
        <Help error={errors.game} />
      </fieldset>

      <div className="field">
        <label className="field__label" htmlFor="name">
          Server name<span className="field__req">*</span>
        </label>
        <input
          className="input"
          id="name"
          name="name"
          maxLength={60}
          defaultValue={values.name}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby="name-help"
          placeholder="Ashfall Roleplay"
        />
        <span id="name-help">
          <Help error={errors.name} />
        </span>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="tagline">
          One-line summary<span className="field__req">*</span>
        </label>
        <input
          className="input"
          id="tagline"
          name="tagline"
          maxLength={120}
          defaultValue={values.tagline}
          aria-invalid={errors.tagline ? true : undefined}
          placeholder="Whitelisted city RP with a working court system."
        />
        <Help error={errors.tagline}>
          The line players read in the grid. Say what makes this server different.
        </Help>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="description">
          Description<span className="field__req">*</span>
        </label>
        <textarea
          className="textarea"
          id="description"
          name="description"
          maxLength={6000}
          defaultValue={values.description}
          aria-invalid={errors.description ? true : undefined}
          placeholder={
            "Rules, factions, wipe schedule, peak hours, what you expect from new players…"
          }
        />
        <Help error={errors.description}>
          Line breaks are kept. Be specific — this is what stops the wrong players applying.
        </Help>
      </div>

      <div className="field-row field-row--2">
        <div className="field">
          <label className="field__label" htmlFor="avgPlayers">
            Average players online<span className="field__req">*</span>
          </label>
          <input
            className="input"
            id="avgPlayers"
            name="avgPlayers"
            type="number"
            inputMode="numeric"
            min={0}
            max={100000}
            defaultValue={values.avgPlayers}
            aria-invalid={errors.avgPlayers ? true : undefined}
            placeholder="142"
          />
          <Help error={errors.avgPlayers}>A typical evening, not your record night.</Help>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="maxPlayers">
            Slot count
          </label>
          <input
            className="input"
            id="maxPlayers"
            name="maxPlayers"
            type="number"
            inputMode="numeric"
            min={1}
            max={100000}
            defaultValue={values.maxPlayers}
            aria-invalid={errors.maxPlayers ? true : undefined}
            placeholder="180"
          />
          <Help error={errors.maxPlayers}>Optional. How many the server can hold.</Help>
        </div>
      </div>

      <fieldset className="filters__group">
        <legend className="field__label">
          Where is it hosted?<span className="field__req">*</span>
        </legend>
        <div className="picker" style={{ marginBlockStart: "var(--space-xs)" }}>
          {REGIONS.map((option) => (
            <label className="picker__option" key={option}>
              <input type="radio" name="region" value={option} defaultChecked={option === "US"} />
              <span className="picker__title">{REGION_LONG[option]}</span>
            </label>
          ))}
        </div>
        <Help error={errors.region} />
      </fieldset>

      <fieldset className="filters__group">
        <legend className="field__label">
          Playstyle<span className="field__req">*</span>
        </legend>
        <div className="picker" style={{ marginBlockStart: "var(--space-xs)" }}>
          {PLAYSTYLES.map((option) => (
            <label className="picker__option" key={option}>
              <input
                type="radio"
                name="playstyle"
                value={option}
                defaultChecked={option === "SERIOUS_RP"}
              />
              <span className="picker__title">{PLAYSTYLE_LABEL[option]}</span>
              <span className="picker__hint">{PLAYSTYLE_HINT[option]}</span>
            </label>
          ))}
        </div>
        <Help error={errors.playstyle} />
      </fieldset>

      <div className="field">
        <span className="field__label">Rules</span>
        <div className="field-row" style={{ gap: "var(--space-xs)" }}>
          <label className="switch">
            <input type="checkbox" name="pvp" />
            <span className="switch__text">
              <span className="switch__title">Player versus player is on</span>
              <span className="switch__hint">
                Players can kill each other outside of designated safe zones.
              </span>
            </span>
          </label>

          {/* FiveM only — the field is not rendered for other games, and the
              server strips any value that arrives for them anyway. */}
          {showDrugs ? (
            <label className="switch">
              <input type="checkbox" name="drugs" />
              <span className="switch__text">
                <span className="switch__title">There is a drug economy</span>
                <span className="switch__hint">
                  FiveM only. Selling, running or manufacturing is part of how players earn.
                </span>
              </span>
            </label>
          ) : null}
        </div>
      </div>

      <div className="field">
        <span className="field__label">Server picture</span>
        <ImageUpload />
      </div>

      <div className="field-row field-row--3">
        <div className="field">
          <label className="field__label" htmlFor="connectUrl">
            Connect address
          </label>
          <input
            className="input"
            id="connectUrl"
            name="connectUrl"
            defaultValue={values.connectUrl}
            placeholder="cfx.re/join/ashfall"
          />
          <Help error={errors.connectUrl} />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="websiteUrl">
            Website
          </label>
          <input
            className="input"
            id="websiteUrl"
            name="websiteUrl"
            type="url"
            defaultValue={values.websiteUrl}
            aria-invalid={errors.websiteUrl ? true : undefined}
            placeholder="https://"
          />
          <Help error={errors.websiteUrl} />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="discordUrl">
            Discord invite
          </label>
          <input
            className="input"
            id="discordUrl"
            name="discordUrl"
            type="url"
            defaultValue={values.discordUrl}
            aria-invalid={errors.discordUrl ? true : undefined}
            placeholder="https://discord.gg/"
          />
          <Help error={errors.discordUrl} />
        </div>
      </div>

      <div>
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? (
            <>
              <span className="btn__spinner" aria-hidden="true" />
              Publishing…
            </>
          ) : (
            "Publish listing"
          )}
        </button>
      </div>
    </form>
  );
}
