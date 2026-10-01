// ========================================
// SUPABASE CONFIG
// ========================================

const SUPABASE_URL =
  "https://zfhulkqlnwxcpfelhvmh.supabase.co";

// MASUKKAN PUBLISHABLE KEY / ANON KEY KAMU DI SINI
const SUPABASE_KEY =
  "sb_publishable_5lhSzbkgtVHA03DQbTP6yw_CodtM65a";

const db =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// ========================================
// DATA
// ========================================

let products = [];
let settings = {};

let cat = "Semua";

const selectedSizes = {};

const CATEGORIES = [
  "Semua",
  "Grape",
  "Strawberry",
  "Banana",
  "Mix Fruit"
];


// ========================================
// DEFAULT SETTINGS
// ========================================

const settingDefault = {
  name: "Sweety Berry",

  description:
    "Perpaduan strawberry segar dan cokelat yang dibuat dengan penuh rasa.",

  whatsapp: "6287845809969",

  instagram: "@sweety.berry",

  hours: "Setiap hari, 10.00–21.00",

  address: "Sweet Berry Babarsari",

  tagline: "Fresh • Sweet • Homemade",

  maps_url:
    "https://maps.app.goo.gl/PmF1YXZGbTHDiSKGA"
};


// ========================================
// NORMALIZE CATEGORY
// ========================================

function normalizeCategory(category) {

  if (category === "Anggur") {
    return "Grape";
  }

  if (category === "Pisang") {
    return "Banana";
  }

  if (category === "Minuman") {
    return "Mix Fruit";
  }

  if (category === "Dessert") {
    return "Mix Fruit";
  }

  if (CATEGORIES.includes(category)) {
    return category;
  }

  return "Mix Fruit";
}


// ========================================
// NORMALIZE PRICE
// ========================================

function normalizePrice(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return number > 0
    ? number
    : null;
}


// ========================================
// NORMALIZE PRODUCT
// ========================================

function normalizeProduct(product) {

  return {

    id:
      product.id,

    name:
      product.name || "",

    description:
      product.description || "",

    priceSmall:
      normalizePrice(
        product.price_small
      ),

    priceRegular:
      normalizePrice(
        product.price_regular
      ),

    priceSmallDubai:
      normalizePrice(
        product.price_small_dubai
      ),

    priceRegularDubai:
      normalizePrice(
        product.price_regular_dubai
      ),

    category:
      normalizeCategory(
        product.category
      ),

    image:
      product.image || "",

    available:
      product.available !== false
  };
}


// ========================================
// LOAD PRODUCTS FROM SUPABASE
// ========================================

async function loadProducts() {

  const {
    data,
    error
  } = await db
    .from("products")
    .select("*")
    .order(
      "created_at",
      {
        ascending: true
      }
    );

  if (error) {

    console.error(
      "Gagal mengambil produk:",
      error
    );

    products = [];

    return;
  }

  products =
    (data || []).map(
      normalizeProduct
    );
}


// ========================================
// LOAD SETTINGS FROM SUPABASE
// ========================================

async function loadSettings() {

  const {
    data,
    error
  } = await db
    .from("store_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {

    console.error(
      "Gagal mengambil pengaturan toko:",
      error
    );

    settings =
      {
        ...settingDefault
      };

    return;
  }

  settings =
    {
      ...settingDefault,
      ...(data || {})
    };
}


// ========================================
// FORMAT RUPIAH
// ========================================

function rp(number) {

  if (
    number === null ||
    number === undefined ||
    number === "" ||
    Number(number) <= 0
  ) {
    return "";
  }

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }
  ).format(
    Number(number)
  );
}


// ========================================
// ESCAPE HTML
// ========================================

function esc(value) {

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]
  );
}


// ========================================
// WHATSAPP
// ========================================

function normalizeWhatsApp(number) {

  let phone =
    String(
      number || ""
    ).replace(
      /\D/g,
      ""
    );

  if (
    phone.startsWith("0")
  ) {

    phone =
      "62" +
      phone.slice(1);
  }

  if (
    phone &&
    !phone.startsWith("62")
  ) {

    phone =
      "62" +
      phone;
  }

  return phone;
}


function wa(message) {

  const nomor =
    normalizeWhatsApp(
      settings.whatsapp ||
      "6287845809969"
    );

  if (!nomor) {

    alert(
      "Nomor WhatsApp belum diatur di Admin."
    );

    return "#";
  }

  return (
    "https://wa.me/" +
    nomor +
    "?text=" +
    encodeURIComponent(
      message
    )
  );
}


// ========================================
// INSTAGRAM
// ========================================

function instagramUrl(username) {

  let value =
    String(
      username || ""
    )
      .trim()
      .replace(
        /^@/,
        ""
      );

  if (!value) {
    return "#";
  }

  return (
    "https://www.instagram.com/" +
    value +
    "/"
  );
}


// ========================================
// SELECT SIZE
// ========================================

function selectSize(
  productId,
  size
) {

  if (
    size !== "Small" &&
    size !== "Regular"
  ) {
    return;
  }

  selectedSizes[
    productId
  ] = size;

  render();
}


// ========================================
// RENDER WEBSITE
// ========================================

function render() {

  // ------------------------------------
  // HERO
  // ------------------------------------

  const heroDesc =
    document.getElementById(
      "heroDesc"
    );

  if (heroDesc) {

    heroDesc.textContent =
      settings.description || "";
  }


  // ------------------------------------
  // ABOUT
  // ------------------------------------

  const aboutName =
    document.getElementById(
      "aboutName"
    );

  if (aboutName) {

    aboutName.textContent =
      settings.name ||
      "Sweety Berry";
  }


  const aboutDesc =
    document.getElementById(
      "aboutDesc"
    );

  if (aboutDesc) {

    aboutDesc.textContent =
      settings.description || "";
  }


  // ------------------------------------
  // HOURS
  // ------------------------------------

  const hours =
    document.getElementById(
      "hours"
    );

  if (hours) {

    hours.textContent =
      settings.hours || "";
  }


  // ------------------------------------
  // WHATSAPP
  // ------------------------------------

  const waButton =
    document.getElementById(
      "wa"
    );

  if (waButton) {

    waButton.href =
      wa(
        "Halo " +
        (
          settings.name ||
          "Sweety Berry"
        ) +
        ", saya ingin memesan."
      );

    waButton.target =
      "_blank";

    waButton.rel =
      "noopener noreferrer";
  }


  // ------------------------------------
  // INSTAGRAM
  // ------------------------------------

  const instagram =
    document.getElementById(
      "instagram"
    );

  if (instagram) {

    instagram.href =
      instagramUrl(
        settings.instagram
      );

    instagram.target =
      "_blank";

    instagram.rel =
      "noopener noreferrer";
  }


  // ------------------------------------
  // GOOGLE MAPS
  // ------------------------------------

  const address =
    document.getElementById(
      "address"
    );

  const maps =
    document.getElementById(
      "maps"
    );

  const mapsUrl =
    settings.maps_url ||
    "https://maps.app.goo.gl/PmF1YXZGbTHDiSKGA";


  if (address) {

    address.textContent =
      settings.address ||
      "Sweet Berry Babarsari";

    address.href =
      mapsUrl;

    address.target =
      "_blank";

    address.rel =
      "noopener noreferrer";
  }


  if (maps) {

    maps.href =
      mapsUrl;

    maps.target =
      "_blank";

    maps.rel =
      "noopener noreferrer";
  }


  // ------------------------------------
  // CATEGORY
  // ------------------------------------

  const cats =
    document.getElementById(
      "cats"
    );

  if (
    cat !== "Semua" &&
    !CATEGORIES.includes(cat)
  ) {

    cat = "Semua";
  }


  if (cats) {

    cats.innerHTML =
      CATEGORIES
        .map(
          category => `
            <button
              type="button"
              class="chip ${
                category === cat
                  ? "active"
                  : ""
              }"
              onclick="setCat('${esc(
                category
              )}')"
            >
              ${esc(
                category
              )}
            </button>
          `
        )
        .join("");
  }


  // ------------------------------------
  // SEARCH
  // ------------------------------------

  const search =
    document.getElementById(
      "search"
    );

  const keyword =
    search
      ? (
          search.value ||
          ""
        )
          .trim()
          .toLowerCase()
      : "";


  // ------------------------------------
  // FILTER
  // ------------------------------------

  const filtered =
    products.filter(
      product => {

        const normalizedCategory =
          normalizeCategory(
            product.category
          );

        const categoryMatch =
          cat === "Semua" ||
          normalizedCategory === cat;

        const searchText = (
          product.name +
          " " +
          product.description +
          " " +
          normalizedCategory
        ).toLowerCase();

        const searchMatch =
          searchText.includes(
            keyword
          );

        return (
          categoryMatch &&
          searchMatch
        );
      }
    );


  // ------------------------------------
  // EMPTY
  // ------------------------------------

  const empty =
    document.getElementById(
      "empty"
    );

  if (empty) {

    empty.classList.toggle(
      "hidden",
      filtered.length > 0
    );
  }


  // ------------------------------------
  // PRODUCTS
  // ------------------------------------

  const productsElement =
    document.getElementById(
      "products"
    );

  if (!productsElement) {

    console.error(
      "Element #products tidak ditemukan."
    );

    return;
  }


  productsElement.innerHTML =
    filtered
      .map(
        product => {

          const hasSmall =
            product.priceSmall !== null &&
            Number(
              product.priceSmall
            ) > 0;

          const hasRegular =
            product.priceRegular !== null &&
            Number(
              product.priceRegular
            ) > 0;

          const hasSmallDubai =
            product.priceSmallDubai !== null &&
            Number(
              product.priceSmallDubai
            ) > 0;

          const hasRegularDubai =
            product.priceRegularDubai !== null &&
            Number(
              product.priceRegularDubai
            ) > 0;


          // --------------------------------
          // DEFAULT SIZE
          // --------------------------------

          let selectedSize =
            selectedSizes[
              product.id
            ];


          if (
            selectedSize === "Small" &&
            !hasSmall
          ) {

            selectedSize =
              hasRegular
                ? "Regular"
                : null;
          }


          if (
            selectedSize === "Regular" &&
            !hasRegular
          ) {

            selectedSize =
              hasSmall
                ? "Small"
                : null;
          }


          if (!selectedSize) {

            selectedSize =
              hasSmall
                ? "Small"
                : hasRegular
                  ? "Regular"
                  : null;

            if (selectedSize) {

              selectedSizes[
                product.id
              ] = selectedSize;
            }
          }


          // --------------------------------
          // PRICE
          // --------------------------------

          let selectedPrice = null;

          let selectedDubaiPrice = null;


          if (
            selectedSize === "Small"
          ) {

            selectedPrice =
              product.priceSmall;

            selectedDubaiPrice =
              product.priceSmallDubai;
          }


          if (
            selectedSize === "Regular"
          ) {

            selectedPrice =
              product.priceRegular;

            selectedDubaiPrice =
              product.priceRegularDubai;
          }


          const hasSelectedDubai =
            selectedDubaiPrice !== null &&
            Number(
              selectedDubaiPrice
            ) > 0;


          // --------------------------------
          // SIZE BUTTON
          // --------------------------------

          let sizeHTML = "";


          if (
            product.available &&
            (
              hasSmall ||
              hasRegular
            )
          ) {

            sizeHTML = `
              <div class="size-label">
                Pilih Ukuran
              </div>

              <div class="size-options">

                ${
                  hasSmall
                    ? `
                      <button
                        type="button"
                        class="size-btn ${
                          selectedSize ===
                          "Small"
                            ? "active"
                            : ""
                        }"
                        onclick="selectSize(
                          '${esc(
                            product.id
                          )}',
                          'Small'
                        )"
                      >
                        Small
                      </button>
                    `
                    : ""
                }

                ${
                  hasRegular
                    ? `
                      <button
                        type="button"
                        class="size-btn ${
                          selectedSize ===
                          "Regular"
                            ? "active"
                            : ""
                        }"
                        onclick="selectSize(
                          '${esc(
                            product.id
                          )}',
                          'Regular'
                        )"
                      >
                        Regular
                      </button>
                    `
                    : ""
                }

              </div>
            `;
          }


          // --------------------------------
          // PRICE HTML
          // --------------------------------

          const priceHTML =
            selectedPrice
              ? `
                <div class="price">
                  ${rp(
                    selectedPrice
                  )}
                </div>
              `
              : "";


          // --------------------------------
          // DUBAI HTML
          // --------------------------------

          const dubaiHTML =
            product.available &&
            hasSelectedDubai
              ? `
                <div class="addon-price">

                  <div class="addon-price-title">
                    + Dubai Chewy
                  </div>

                  <div class="price">
                    ${rp(
                      selectedDubaiPrice
                    )}
                  </div>

                </div>
              `
              : "";


          // --------------------------------
          // PRODUCT CARD
          // --------------------------------

          return `
            <article class="card">

              <div class="photo">

                ${
                  product.image
                    ? `
                      <img
                        src="${esc(
                          product.image
                        )}"
                        alt="${esc(
                          product.name
                        )}"
                        loading="lazy"
                      >
                    `
                    : `
                      <div
                        class="photo-placeholder"
                      >
                        🍓
                      </div>
                    `
                }

                <span
                  class="
                    badge
                    ${
                      product.available
                        ? ""
                        : "off"
                    }
                  "
                >
                  ${
                    product.available
                      ? "Tersedia"
                      : "Habis"
                  }
                </span>

              </div>


              <div class="body">

                <small>
                  ${esc(
                    normalizeCategory(
                      product.category
                    )
                  )}
                </small>

                <h3>
                  ${esc(
                    product.name
                  )}
                </h3>

                <p>
                  ${esc(
                    product.description
                  )}
                </p>


                ${
                  product.available
                    ? `
                      ${sizeHTML}

                      ${priceHTML}

                      ${dubaiHTML}
                    `
                    : `
                      ${
                        selectedPrice
                          ? `
                            <div class="price">
                              ${rp(
                                selectedPrice
                              )}
                            </div>
                          `
                          : ""
                      }

                      <span
                        class="btn secondary"
                      >
                        Tidak Tersedia
                      </span>
                    `
                }

              </div>

            </article>
          `;
        }
      )
      .join("");
}


// ========================================
// CATEGORY BUTTON
// ========================================

function setCat(category) {

  if (
    CATEGORIES.includes(
      category
    )
  ) {

    cat =
      category;

  } else {

    cat =
      "Semua";
  }

  render();
}


// ========================================
// SEARCH EVENT
// ========================================

const search =
  document.getElementById(
    "search"
  );

if (search) {

  search.addEventListener(
    "input",
    render
  );
}


// ========================================
// INITIAL LOAD
// ========================================

async function init() {

  const productsElement =
    document.getElementById(
      "products"
    );

  if (productsElement) {

    productsElement.innerHTML = `
      <p>
        Memuat katalog...
      </p>
    `;
  }


  await Promise.all([
    loadProducts(),
    loadSettings()
  ]);


  render();
}


// ========================================
// START
// ========================================

init();