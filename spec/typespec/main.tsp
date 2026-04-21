import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";
import "./models.tsp";
import "./errors.tsp";
import "./routes/guest.tsp";
import "./routes/owner.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.OpenAPI;

@service({
  title: "Call Calendar API"
})
@server("http://localhost:3000", "Local development")
namespace CallCalendar;
