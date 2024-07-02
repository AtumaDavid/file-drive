import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

// Create an HTTP router
const http = httpRouter();

http.route({
  path: "/clerk", // Define the endpoint path for Clerk webhooks
  method: "POST", // Specify the HTTP method as POST
  handler: httpAction(async (ctx, request) => {
    // Extract the payload and headers from the request
    // Extract and process webhook payload
    const payloadString = await request.text();
    const headerPayload = request.headers;

    try {
      // Call an internal action to process the Clerk webhook
      const result = await ctx.runAction(internal.clerk.fulfill, {
        payload: payloadString,
        headers: {
          "svix-id": headerPayload.get("svix-id")!,
          "svix-timestamp": headerPayload.get("svix-timestamp")!,
          "svix-signature": headerPayload.get("svix-signature")!,
        },
      });

      // Handle different types of webhook events
      switch (result.type) {
        case "user.created":
          // Create a new user in the Convex database
          await ctx.runMutation(internal.users.createUser, {
            tokenIdentifier: `https://${process.env.CLERK_HOSTNAME}|${result.data.id}`,
            name: `${result.data.first_name ?? ""} ${result.data.last_name ?? ""}`,
            image: result.data.image_url,
          });
          break;
        case "user.updated":
          // Update an existing user in the Convex database
          await ctx.runMutation(internal.users.updateUser, {
            tokenIdentifier: `https://${process.env.CLERK_HOSTNAME}|${result.data.id}`,
            name: `${result.data.first_name ?? ""} ${result.data.last_name ?? ""}`,
            image: result.data.image_url,
          });
          break;
        case "organizationMembership.created":
          // Add organization ID to a user in the Convex database
          await ctx.runMutation(internal.users.addOrgIdToUser, {
            tokenIdentifier: `https://${process.env.CLERK_HOSTNAME}|${result.data.public_user_data.user_id}`,
            orgId: result.data.organization.id,
            role: result.data.role === "org:admin" ? "admin" : "member",
          });
          break;
        case "organizationMembership.updated":
          console.log(result.data.role);
          // Update a user's role in an organization in the Convex database
          await ctx.runMutation(internal.users.updateRoleInOrgForUser, {
            tokenIdentifier: `https://${process.env.CLERK_HOSTNAME}|${result.data.public_user_data.user_id}`,
            orgId: result.data.organization.id,
            role: result.data.role === "org:admin" ? "admin" : "member",
          });
          break;
      }

      // Return a successful response
      return new Response(null, { status: 200 });
    } catch (err) {
      // Return an error response if something goes wrong
      return new Response("Webhook Error", { status: 400 });
    }
  }),
});

// Export the configured HTTP router
export default http;
