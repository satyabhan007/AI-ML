"""AI-ML · Part 6 lab — Feast feature definitions (Ch 5).

One definition per feature, materialised to BOTH the offline store (training,
point-in-time correct) and the online store (serving). `feast apply` loads this;
`feast get-historical-features` builds training sets with as-of joins.

CI only syntax-checks this file (`python -m py_compile`) — running it needs the
`feast` package (`pip install feast[redis]`).
"""
from datetime import timedelta

try:
    from feast import Entity, FeatureView, Field, FileSource, ValueType
    from feast.types import Float32, Int64
except ImportError:  # pragma: no cover - repo definition, not a standalone script
    raise SystemExit(
        "This is a Feast repo definition. Install feast and run `feast apply` "
        "from this directory."
    )

user = Entity(name="user", join_keys=["user_id"], value_type=ValueType.INT64)

# the raw event table; `event_timestamp` drives the point-in-time join
orders_source = FileSource(
    path="data/orders.parquet",
    timestamp_field="event_timestamp",
    created_timestamp_column="created",
)

user_order_stats = FeatureView(
    name="user_order_stats",
    entities=[user],
    ttl=timedelta(days=2),          # online value older than this is treated as missing
    schema=[
        Field(name="orders_30d", dtype=Int64),
        Field(name="avg_order_value_30d", dtype=Float32),
        Field(name="days_since_last_order", dtype=Int64),
    ],
    online=True,                    # materialise to Redis for serving
    source=orders_source,
    tags={"team": "ranking", "pii": "false"},
)
