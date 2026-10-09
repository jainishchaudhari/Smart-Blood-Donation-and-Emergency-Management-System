
function Home() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center bg-red-50 px-6 text-center">
      <p className="mb-4 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-600">
        GIVE BLOOD, SAVE LIVES
      </p>

      <h1 className="max-w-3xl text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
        Every Drop Counts.
        <span className="block text-red-600">
          Every Life Matters.
        </span>
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-gray-600">
        Connecting blood donors, patients, hospitals and blood banks
        to help save lives during emergencies.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700">
          Find Blood
        </button>

        <button className="rounded-lg border-2 border-red-600 px-6 py-3 font-semibold text-red-600 transition hover:bg-red-100">
          Become a Donor
        </button>
      </div>
    </section>
  )
}

export default Home