from pyteal import *

class CarbonMarketplace:
    """Smart contract for Carbon Credit Marketplace on Algorand"""
    
    def __init__(self):
        self.router = Router(
            name="CarbonMarketplace",
            bare_calls=BareCallActions(
                no_op=OnCallActions.create_only(Approve()),
                opt_in=OnCallActions.call_only(Approve()),
                close_out=OnCallActions.call_only(Approve()),
                clear_state=OnCallActions.call_only(Approve()),
            ),
        )
        
        # Global state variables
        self.total_projects = Bytes("total_projects")
        self.total_credits_issued = Bytes("total_credits_issued")
        self.total_credits_retired = Bytes("total_credits_retired")
        self.marketplace_fee = Bytes("marketplace_fee")  # Basis points (e.g., 100 = 1%)
        self.admin_address = Bytes("admin_address")
        
        # Local state variables (per user)
        self.user_credits_owned = Bytes("credits_owned")
        self.user_credits_retired = Bytes("credits_retired")
        
        self.define_routes()
    
    def define_routes(self):
        """Define all the routes for the smart contract"""
        
        @self.router.method
        def initialize_marketplace(
            fee_basis_points: abi.Uint64,
            admin: abi.Address,
        ) -> Expr:
            """Initialize the marketplace with admin and fee structure"""
            return Seq(
                Assert(Txn.sender() == Global.creator_address()),
                App.globalPut(self.marketplace_fee, fee_basis_points.get()),
                App.globalPut(self.admin_address, admin.get()),
                App.globalPut(self.total_projects, Int(0)),
                App.globalPut(self.total_credits_issued, Int(0)),
                App.globalPut(self.total_credits_retired, Int(0)),
            )
        
        @self.router.method
        def register_project(
            project_name: abi.String,
            project_type: abi.Uint64,
            verification_standard: abi.Uint64,
            total_credits: abi.Uint64,
            price_per_credit: abi.Uint64,
            vintage: abi.Uint64,
        ) -> Expr:
            """Register a new carbon credit project"""
            return Seq(
                # Only admin can register projects
                Assert(Txn.sender() == App.globalGet(self.admin_address)),
                
                # Create project record in global state
                App.globalPut(
                    Concat(Bytes("project_"), Itob(App.globalGet(self.total_projects))),
                    Concat(
                        project_name.get(),
                        Bytes("|"),
                        Itob(project_type.get()),
                        Bytes("|"),
                        Itob(verification_standard.get()),
                        Bytes("|"),
                        Itob(total_credits.get()),
                        Bytes("|"),
                        Itob(price_per_credit.get()),
                        Bytes("|"),
                        Itob(vintage.get()),
                    )
                ),
                
                # Increment total projects
                App.globalPut(
                    self.total_projects,
                    App.globalGet(self.total_projects) + Int(1)
                ),
                
                # Update total credits issued
                App.globalPut(
                    self.total_credits_issued,
                    App.globalGet(self.total_credits_issued) + total_credits.get()
                ),
            )
        
        @self.router.method
        def purchase_credits(
            project_id: abi.Uint64,
            quantity: abi.Uint64,
            payment: abi.PaymentTransaction,
        ) -> Expr:
            """Purchase carbon credits from a project"""
            return Seq(
                # Verify payment transaction
                Assert(payment.get().receiver() == Global.current_application_address()),
                Assert(payment.get().amount() >= quantity.get() * self.get_project_price(project_id.get())),
                
                # Update user's local state
                App.localPut(
                    Txn.sender(),
                    self.user_credits_owned,
                    App.localGet(Txn.sender(), self.user_credits_owned) + quantity.get()
                ),
                
                # Record the purchase (simplified - in production would use box storage)
                App.globalPut(
                    Concat(Bytes("purchase_"), Txn.sender(), Bytes("_"), Itob(Global.latest_timestamp())),
                    Concat(
                        Itob(project_id.get()),
                        Bytes("|"),
                        Itob(quantity.get()),
                        Bytes("|"),
                        Itob(payment.get().amount()),
                    )
                ),
            )
        
        @self.router.method
        def retire_credits(
            quantity: abi.Uint64,
            retirement_reason: abi.String,
            beneficiary: abi.String,
        ) -> Expr:
            """Retire carbon credits (remove from circulation)"""
            return Seq(
                # Verify user has enough credits
                Assert(App.localGet(Txn.sender(), self.user_credits_owned) >= quantity.get()),
                
                # Update user's local state
                App.localPut(
                    Txn.sender(),
                    self.user_credits_owned,
                    App.localGet(Txn.sender(), self.user_credits_owned) - quantity.get()
                ),
                App.localPut(
                    Txn.sender(),
                    self.user_credits_retired,
                    App.localGet(Txn.sender(), self.user_credits_retired) + quantity.get()
                ),
                
                # Update global retirement count
                App.globalPut(
                    self.total_credits_retired,
                    App.globalGet(self.total_credits_retired) + quantity.get()
                ),
                
                # Record retirement
                App.globalPut(
                    Concat(Bytes("retirement_"), Txn.sender(), Bytes("_"), Itob(Global.latest_timestamp())),
                    Concat(
                        Itob(quantity.get()),
                        Bytes("|"),
                        retirement_reason.get(),
                        Bytes("|"),
                        beneficiary.get(),
                    )
                ),
            )
        
        @self.router.method
        def transfer_credits(
            recipient: abi.Address,
            quantity: abi.Uint64,
        ) -> Expr:
            """Transfer credits between users"""
            return Seq(
                # Verify sender has enough credits
                Assert(App.localGet(Txn.sender(), self.user_credits_owned) >= quantity.get()),
                
                # Update sender's balance
                App.localPut(
                    Txn.sender(),
                    self.user_credits_owned,
                    App.localGet(Txn.sender(), self.user_credits_owned) - quantity.get()
                ),
                
                # Update recipient's balance
                App.localPut(
                    recipient.get(),
                    self.user_credits_owned,
                    App.localGet(recipient.get(), self.user_credits_owned) + quantity.get()
                ),
                
                # Record transfer
                App.globalPut(
                    Concat(Bytes("transfer_"), Itob(Global.latest_timestamp())),
                    Concat(
                        Txn.sender(),
                        Bytes("|"),
                        recipient.get(),
                        Bytes("|"),
                        Itob(quantity.get()),
                    )
                ),
            )
        
        @self.router.method
        def get_user_credits(user: abi.Address, *, output: abi.Uint64) -> Expr:
            """Get the number of credits owned by a user"""
            return output.set(App.localGet(user.get(), self.user_credits_owned))
        
        @self.router.method
        def get_marketplace_stats(*, output: abi.String) -> Expr:
            """Get marketplace statistics"""
            return output.set(
                Concat(
                    Bytes("projects:"),
                    Itob(App.globalGet(self.total_projects)),
                    Bytes("|issued:"),
                    Itob(App.globalGet(self.total_credits_issued)),
                    Bytes("|retired:"),
                    Itob(App.globalGet(self.total_credits_retired)),
                )
            )
    
    def get_project_price(self, project_id: Expr) -> Expr:
        """Helper function to get project price per credit"""
        project_data = App.globalGet(Concat(Bytes("project_"), Itob(project_id)))
        # Parse the price from the stored project data (5th field)
        # This is simplified - in production would use proper parsing
        return Int(1000000)  # 1 ALGO per credit as default
    
    def approval_program(self):
        """Main approval program"""
        return self.router.compile_program(version=8)
    
    def clear_program(self):
        """Clear program (always approve)"""
        return Approve()

# Compilation functions
def compile_carbon_marketplace():
    """Compile the carbon marketplace smart contract"""
    marketplace = CarbonMarketplace()
    
    approval_program = marketplace.approval_program()
    clear_program = marketplace.clear_program()
    
    return approval_program, clear_program

if __name__ == "__main__":
    approval, clear = compile_carbon_marketplace()
    
    # Write compiled programs to files
    with open("carbon_marketplace_approval.teal", "w") as f:
        f.write(approval)
    
    with open("carbon_marketplace_clear.teal", "w") as f:
        f.write(clear)
    
    print("Carbon Marketplace smart contract compiled successfully!")
    print("Approval program saved to: carbon_marketplace_approval.teal")
    print("Clear program saved to: carbon_marketplace_clear.teal")