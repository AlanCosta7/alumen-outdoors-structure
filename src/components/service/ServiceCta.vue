<template>
  <section class="service-cta" aria-label="Call to action — contact us">
    <div class="service-cta__inner">
      <p class="service-cta__text">
        Ready to transform your enclosure?<br />
        Call today.
      </p>
      <a
        href="tel:+19415265425"
        class="service-cta__btn"
        aria-label="Call us at (941) 526-5425"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
        </svg>
        (941) 526-5425
      </a>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use 'sass:color';

.service-cta {
  background-color: $brand-white;
  padding: 72px 0;

  @media (max-width: 599px) { padding: 52px 0; }

  &__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
    text-align: center;
    padding: 0 24px;
  }

  &__text {
    font-family: $font-family-body;
    font-size: clamp(20px, 3vw, 30px);
    font-weight: 900;
    color: $brand-taupe;
    line-height: 1.4;
    margin: 0;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background-color: $brand-dark;
    color: $brand-white;
    font-family: $font-family-body;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-decoration: none;
    padding: 14px 28px;
    border-radius: 6px;
    transition: background-color 0.2s;
    min-height: 48px;

    &:hover { background-color: color.adjust($brand-dark, $lightness: 8%); }
    &:focus-visible { outline: 2px solid $brand-taupe; outline-offset: 3px; }

    svg { flex-shrink: 0; }
  }
}
</style>
