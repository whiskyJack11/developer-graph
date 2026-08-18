import neo4j, { type Driver } from "neo4j-driver";

let driver: Driver | null = null;

function getDriver(): Driver {
  if (driver) {
    return driver;
  }

  const uri = process.env.COGNODB_URI;
  const username = process.env.COGNODB_USERNAME;
  const password = process.env.COGNODB_PASSWORD;

  if (!uri || !username || !password) {
    throw new Error(
      "Missing CognoDB environment variables."
    );
  }

  driver = neo4j.driver(
    uri,
    neo4j.auth.basic(username, password),
    {
    disableLosslessIntegers: true,
  }
  );

  return driver;
}

export async function runQuery<T>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const session = getDriver().session();

  try {
    const result = await session.run(query, params);

    return result.records.map(
      (record) => record.toObject() as T
    );
  } finally {
    await session.close();
  }
}